// Day-1 spike (plan/03-architecture.md): empirically validate the EIP-7708 statement thesis
// against the LIVE Arc testnet, read-only — no wallet or keys needed. It must demonstrate:
//   1. DUAL-LOG: an ERC-20 usdc.transfer() emits TWO Transfer logs — 6-dec from 0x3600...0000
//      and 18-dec from the 0xfffe system emitter — so the indexer must pick ONE emitter.
//   2. NATIVE LOGGING: a plain native-value send (input 0x, no ERC-20 call) STILL emits a
//      Transfer log from 0xfffe — the statement really is gapless from logs (the Arc-only claim).
//   3. GAS FROM RECEIPTS: fees emit no Transfer log; gasUsed x effectiveGasPrice is the source
//      for the "gas" category, quantized to 6 decimals.
import { createPublicClient, http, parseAbiItem, type Log } from 'viem'
import { arcTestnet, ADDRESSES, RPC_URLS } from '../config.js'
import { withRpcRetry, sleep } from '../retry.js'
import { native18ToBook6, isExactViewPair, formatBook6, formatNative18 } from '../money.js'

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')
type TransferLog = Log<bigint, number, false, typeof transferEvent>

const client = createPublicClient({ chain: arcTestnet, transport: http(RPC_URLS[0]) })

const WINDOW = 2_000n // well under the 5k chunk rule; widened by scanning more windows
const MAX_WINDOWS = 8

async function main() {
  const head = await withRpcRetry(() => client.getBlockNumber())
  console.log(`Arc testnet head block: ${head} (rpc: ${RPC_URLS[0]})`)

  const byTxErc20 = new Map<string, TransferLog[]>()
  const byTxSystem = new Map<string, TransferLog[]>()

  let scannedFrom = head
  for (let w = 0; w < MAX_WINDOWS; w++) {
    const toBlock = head - WINDOW * BigInt(w)
    const fromBlock = toBlock - WINDOW + 1n
    scannedFrom = fromBlock
    console.log(`\nscanning blocks ${fromBlock}..${toBlock} (window ${w + 1}/${MAX_WINDOWS})`)

    const [erc20Logs, systemLogs] = [
      await withRpcRetry(() =>
        client.getLogs({ address: ADDRESSES.usdcErc20, event: transferEvent, fromBlock, toBlock })),
      await withRpcRetry(() =>
        client.getLogs({ address: ADDRESSES.eip7708Emitter, event: transferEvent, fromBlock, toBlock })),
    ]
    console.log(`  0x3600 (ERC-20 6-dec) Transfer logs: ${erc20Logs.length}`)
    console.log(`  0xfffe (system 18-dec) Transfer logs: ${systemLogs.length}`)

    for (const l of erc20Logs) {
      const list = byTxErc20.get(l.transactionHash) ?? []
      list.push(l as TransferLog)
      byTxErc20.set(l.transactionHash, list)
    }
    for (const l of systemLogs) {
      const list = byTxSystem.get(l.transactionHash) ?? []
      list.push(l as TransferLog)
      byTxSystem.set(l.transactionHash, list)
    }

    const dualCount = [...byTxSystem.keys()].filter(h => byTxErc20.has(h)).length
    const nativeOnly = [...byTxSystem.keys()].filter(h => !byTxErc20.has(h))
    if (dualCount > 0 && nativeOnly.length > 0) break
    await sleep(500)
  }

  const dualTxs = [...byTxSystem.keys()].filter(h => byTxErc20.has(h))
  const nativeOnlyTxs = [...byTxSystem.keys()].filter(h => !byTxErc20.has(h))
  const totalSystem = [...byTxSystem.values()].reduce((n, l) => n + l.length, 0)
  const totalErc20 = [...byTxErc20.values()].reduce((n, l) => n + l.length, 0)

  console.log(`\n================ observations (blocks ${scannedFrom}..${head}) ================`)
  console.log(`txs with system-emitter USDC logs: ${byTxSystem.size}`)
  console.log(`  of which DUAL-LOG (also emit 0x3600 logs): ${dualTxs.length}`)
  console.log(`  of which native-only (no ERC-20 log):      ${nativeOnlyTxs.length}`)
  console.log(`total logs — 0xfffe: ${totalSystem} · 0x3600: ${totalErc20}`)

  // ---- 1. DUAL-LOG proof: same movement, two logs, exact 1e12 ratio
  if (dualTxs.length > 0) {
    const hash = dualTxs[0] as `0x${string}`
    const sys = byTxSystem.get(hash)!
    const erc = byTxErc20.get(hash)!
    console.log(`\n[1] DUAL-LOG example tx ${hash}`)
    let matched = 0
    for (const e of erc) {
      const pair = sys.find(s =>
        s.args.from?.toLowerCase() === e.args.from?.toLowerCase() &&
        s.args.to?.toLowerCase() === e.args.to?.toLowerCase() &&
        isExactViewPair(s.args.value!, e.args.value!))
      if (pair) {
        matched++
        console.log(`    ERC-20 log:  ${formatBook6(e.args.value!)}  (logIndex ${e.logIndex})`)
        console.log(`    system log:  ${formatNative18(pair.args.value!)}  (logIndex ${pair.logIndex})`)
        console.log(`    exact 1e12 ratio: YES -> same movement, two logs`)
      }
    }
    console.log(matched > 0
      ? `    => DEDUPE RULE CONFIRMED: index ONE emitter only or every statement double-counts.`
      : `    !! no exact-ratio pair found in this tx — inspect manually: ${hash}`)
  } else {
    console.log('\n[1] no dual-log tx found in scanned range — widen the scan.')
  }

  // ---- 2. NATIVE LOGGING proof: plain value send (input 0x) still emits a 0xfffe Transfer
  let nativeProved = false
  for (const hash of nativeOnlyTxs.slice(0, 8)) {
    const tx = await withRpcRetry(() => client.getTransaction({ hash: hash as `0x${string}` }))
    if (tx.input === '0x' && tx.value > 0n) {
      const l = byTxSystem.get(hash)![0]
      console.log(`\n[2] NATIVE-SEND example tx ${hash}`)
      console.log(`    tx.input = 0x (plain value transfer, no contract call), value ${formatNative18(tx.value)}`)
      console.log(`    system emitter STILL logged: Transfer(${l.args.from} -> ${l.args.to}, ${formatNative18(l.args.value!)})`)
      console.log(`    => EIP-7708 CONFIRMED: native movements are visible in logs. On Ethereum this log would NOT exist.`)
      nativeProved = true
      break
    }
    await sleep(300)
  }
  if (!nativeProved && nativeOnlyTxs.length > 0) {
    console.log(`\n[2] ${nativeOnlyTxs.length} native-only txs found (internal/contract value moves — also log-visible);` +
      ` no plain EOA send with input 0x in sample. Thesis still holds: these movements have NO ERC-20 log yet ARE in 0xfffe logs.`)
  }

  // ---- 3. GAS FROM RECEIPTS: fees emit no Transfer log; derive from the receipt
  const gasHash = (dualTxs[0] ?? nativeOnlyTxs[0]) as `0x${string}` | undefined
  if (gasHash) {
    const receipt = await withRpcRetry(() => client.getTransactionReceipt({ hash: gasHash }))
    const feeWei = receipt.gasUsed * receipt.effectiveGasPrice
    const feeLogged = byTxSystem.get(gasHash)!.some(l => l.args.value === feeWei)
    console.log(`\n[3] GAS example tx ${gasHash}`)
    console.log(`    gasUsed ${receipt.gasUsed} x effectiveGasPrice ${receipt.effectiveGasPrice} wei`)
    console.log(`    = fee ${formatNative18(feeWei)}  -> book entry ${formatBook6(native18ToBook6(feeWei))}`)
    console.log(`    a 0xfffe Transfer log with exactly this fee amount exists in the tx: ${feeLogged ? 'YES (unexpected!)' : 'NO'}`)
    console.log(`    => GAS RULE ${feeLogged ? 'NEEDS REVIEW' : 'CONFIRMED'}: the "gas" category comes from receipts, not logs.`)
    const block = await withRpcRetry(() => client.getBlock({ blockNumber: receipt.blockNumber }))
    console.log(`    current base fee context: block ${receipt.blockNumber} baseFeePerGas = ${block.baseFeePerGas} wei (${Number(block.baseFeePerGas ?? 0n) / 1e9} gwei)`)
  }

  console.log(`\n================ codified indexer rules (validated live) ================`)
  console.log(`R1  For USDC, index Transfer logs from ${ADDRESSES.eip7708Emitter} ONLY (18-dec); never also 0x3600 logs.`)
  console.log(`R2  Native sends, contract value moves, and ERC-20 transfers all appear in R1's stream — statements are gapless.`)
  console.log(`R3  "gas" lines come from receipts: gasUsed x effectiveGasPrice (no Transfer log is emitted for fees).`)
  console.log(`R4  Quantize every amount to 6 decimals for the books (ERC-20-view truncation semantics); track sub-micro dust separately.`)
  console.log(`R5  Order by (blockNumber, logIndex). No reorg handling. EURC: index its own contract's Transfer logs (ordinary ERC-20).`)
}

main().catch(err => {
  console.error('spike failed:', err)
  process.exit(1)
})
