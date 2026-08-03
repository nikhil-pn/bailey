// First fleet transactions: agents paying each other for services in USDC via the Circle
// Wallets SDK (native transfers; Gas Station sponsors gas). Every transfer carries a semantic
// refId — the off-chain context channel the AI bookkeeper reads (on-chain memos are out of
// MVP: EOA-vs-SCA support unresolved). Usage: npm run fleet:demo-txs
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { loadEnv, requireEnv } from '../env.js'
import { sleep, TX_PACE_MS } from '../retry.js'

const require = createRequire(import.meta.url)
const { initiateDeveloperControlledWalletsClient } =
  require('@circle-fin/developer-controlled-wallets') as typeof import('@circle-fin/developer-controlled-wallets')

interface Fleet { wallets: { id: string; address: string; name: string; role: string }[] }

const TRANSFERS: { from: string; to: string; amount: string; refId: string }[] = [
  { from: 'agent-1', to: 'agent-2', amount: '2.50', refId: 'svc:data-feed:hourly' },
  { from: 'agent-2', to: 'agent-3', amount: '1.25', refId: 'svc:compute:batch-42' },
  { from: 'agent-3', to: 'agent-1', amount: '0.80', refId: 'svc:storage:july' },
  { from: 'agent-4', to: 'agent-5', amount: '3.00', refId: 'svc:translation:job-7' },
  { from: 'agent-5', to: 'agent-4', amount: '0.40', refId: 'refund:translation:job-7-partial' },
  { from: 'agent-1', to: 'agent-4', amount: '1.10', refId: 'svc:api-call:v2' },
]

async function main() {
  loadEnv()
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
  })
  const fleet = JSON.parse(readFileSync('fleet.json', 'utf8')) as Fleet
  const byName = new Map(fleet.wallets.map(w => [w.name, w]))

  // USDC token id on ARC-TESTNET — discover from the first funded wallet's balances
  const first = byName.get(TRANSFERS[0].from)!
  const balRes = await client.getWalletTokenBalance({ id: first.id })
  const usdc = balRes.data?.tokenBalances?.find(t => t.token?.symbol === 'USDC')
  if (!usdc?.token?.id) throw new Error(`no USDC token balance found on ${first.name} — is it funded?`)
  const tokenId = usdc.token.id
  console.log(`USDC tokenId on ARC-TESTNET: ${tokenId}\n`)

  for (const t of TRANSFERS) {
    const from = byName.get(t.from)!, to = byName.get(t.to)!
    console.log(`${t.from} → ${t.to}: ${t.amount} USDC  (${t.refId})`)
    const txRes = await client.createTransaction({
      walletId: from.id,
      tokenId,
      destinationAddress: to.address,
      amount: [t.amount],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
      refId: t.refId,
    })
    const txId = txRes.data?.id
    if (!txId) throw new Error(`createTransaction failed for ${t.refId}: ${JSON.stringify(txRes.data)}`)
    for (let i = 0; i < 60; i++) {
      await sleep(Math.max(TX_PACE_MS, 2000))
      const st = await client.getTransaction({ id: txId })
      const state = st.data?.transaction?.state
      if (state === 'COMPLETE') {
        console.log(`  ✓ ${st.data?.transaction?.txHash}`)
        break
      }
      if (state === 'FAILED' || state === 'CANCELLED' || state === 'DENIED') {
        throw new Error(`transfer ${t.refId} ended ${state}: ${st.data?.transaction?.errorReason ?? ''}`)
      }
    }
  }
  console.log('\nall transfers complete — now index them: npm run index -- --watch <fleet addresses>')
}

main().catch(err => { console.error('demo-txs failed:', err); process.exit(1) })
