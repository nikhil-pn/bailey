// Indexer CLI. With no --watch it auto-discovers active addresses on the live chain (a busy
// USDC mover + a recent ERC-8183 job provider) so the whole pipeline can be smoke-tested
// read-only before the fleet exists. Usage:
//   npm run index -- [--blocks 2000] [--watch 0xa,0xb] [--receipts 15] [--db bailey.db]
import { createPublicClient, http, parseAbiItem } from 'viem'
import { arcTestnet, ADDRESSES, RPC_URLS } from '../config.js'
import { withRpcRetry, sleep } from '../retry.js'
import { formatBook6 } from '../money.js'
import { openLedger, upsertAccount } from './db.js'
import { ingestUsdc, ingestGas, ingestJobs } from './ingest.js'

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')
const paymentReleased = parseAbiItem('event PaymentReleased(uint256 indexed jobId, address indexed provider, uint256 amount)')

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const client = createPublicClient({ chain: arcTestnet, transport: http(RPC_URLS[0]) })

async function discover(head: bigint): Promise<Map<string, string>> {
  const found = new Map<string, string>() // address -> label
  const skip = new Set<string>([
    '0x0000000000000000000000000000000000000000',
    ADDRESSES.erc8183Escrow.toLowerCase(),
    ADDRESSES.eip7708Emitter.toLowerCase(),
    ADDRESSES.usdcErc20.toLowerCase(),
  ])

  const logs = await withRpcRetry(() => client.getLogs({
    address: ADDRESSES.eip7708Emitter, event: transferEvent, fromBlock: head - 300n, toBlock: head,
  }))
  const freq = new Map<string, number>()
  for (const l of logs) {
    for (const a of [l.args.from!, l.args.to!]) {
      const addr = a.toLowerCase()
      if (!skip.has(addr)) freq.set(addr, (freq.get(addr) ?? 0) + 1)
    }
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2)
  top.forEach(([addr], i) => found.set(addr, `sample-mover-${i + 1}`))

  const jobLogs = await withRpcRetry(() => client.getLogs({
    address: ADDRESSES.erc8183Escrow, event: paymentReleased, fromBlock: head - 5000n, toBlock: head,
  }))
  const lastPaid = jobLogs.at(-1)
  if (lastPaid) found.set(lastPaid.args.provider!.toLowerCase(), 'sample-job-provider')
  return found
}

async function backfillTimestamps(db: ReturnType<typeof openLedger>, cap = 50) {
  const missing = db.prepare(`
    SELECT DISTINCT e.blockNumber FROM entries e
    LEFT JOIN blocks b ON b.blockNumber = e.blockNumber
    WHERE b.blockNumber IS NULL ORDER BY e.blockNumber DESC LIMIT ?
  `).all(cap) as { blockNumber: number }[]
  const put = db.prepare('INSERT OR IGNORE INTO blocks(blockNumber, ts) VALUES (?, ?)')
  for (const m of missing) {
    const block = await withRpcRetry(() => client.getBlock({ blockNumber: BigInt(m.blockNumber) }))
    put.run(m.blockNumber, Number(block.timestamp))
    await sleep(250)
  }
  return missing.length
}

async function main() {
  const blocks = BigInt(arg('blocks', '2000'))
  const receipts = Number(arg('receipts', '15'))
  const db = openLedger(arg('db', 'bailey.db'))
  const watchArg = arg('watch', '')

  const head = await withRpcRetry(() => client.getBlockNumber())
  const fromBlock = head - blocks + 1n
  console.log(`head ${head} · indexing blocks ${fromBlock}..${head}`)

  let watched: Map<string, string>
  if (watchArg) {
    watched = new Map(watchArg.split(',').map((a, i) => [a.trim().toLowerCase(), `watched-${i + 1}`]))
  } else {
    console.log('no --watch given — auto-discovering active addresses for the smoke test…')
    watched = await discover(head)
  }
  const known = db.prepare('SELECT label FROM accounts WHERE address = ?')
  for (const [addr, label] of watched) {
    const existing = known.get(addr) as { label: string } | undefined
    if (!existing) upsertAccount(db, addr, label, 'external')
    console.log(`  account ${existing?.label ?? label}: ${addr}`)
  }
  const watchedSet = new Set(watched.keys())

  const nTransfers = await ingestUsdc(client, db, watchedSet, fromBlock, head)
  console.log(`transfers ingested: ${nTransfers}`)
  const nJobs = await ingestJobs(client, db, watchedSet, fromBlock, head)
  console.log(`job-event rows ingested: ${nJobs}`)
  const nGas = await ingestGas(client, db, watchedSet, receipts)
  console.log(`gas rows ingested: ${nGas} (cap ${receipts}; Gas-Station-sponsored txs correctly produce none)`)
  const nTs = await backfillTimestamps(db)
  console.log(`block timestamps backfilled: ${nTs}`)

  db.prepare('INSERT INTO cursors(name, lastBlock) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET lastBlock = excluded.lastBlock')
    .run('main', Number(head))

  console.log('\n================ per-account ledger summary ================')
  const summary = db.prepare(`
    SELECT a.label, e.account, e.kind, e.direction, COUNT(*) AS n, SUM(e.amount6) AS total6
    FROM entries e JOIN accounts a ON a.address = e.account
    GROUP BY e.account, e.kind, e.direction ORDER BY a.label, e.kind, e.direction
  `).all() as { label: string; account: string; kind: string; direction: string; n: number; total6: number }[]
  for (const r of summary) {
    console.log(`${r.label.padEnd(22)} ${r.kind.padEnd(20)} ${r.direction.padEnd(4)} ×${String(r.n).padStart(4)}  ${formatBook6(BigInt(r.total6))}`)
  }
  const nets = db.prepare(`
    SELECT a.label, SUM(CASE WHEN e.direction = 'in' THEN e.amount6 ELSE -e.amount6 END) AS net6, COUNT(*) AS n
    FROM entries e JOIN accounts a ON a.address = e.account GROUP BY e.account ORDER BY a.label
  `).all() as { label: string; net6: number; n: number }[]
  console.log('---')
  for (const r of nets) console.log(`${r.label.padEnd(22)} net over period: ${formatBook6(BigInt(r.net6))} (${r.n} entries)`)
}

main().catch(err => { console.error('indexer failed:', err); process.exit(1) })
