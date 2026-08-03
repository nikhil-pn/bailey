import { readFileSync } from 'node:fs'
import { parseAbiItem, type Abi, type PublicClient } from 'viem'
import type Database from 'better-sqlite3'
import { ADDRESSES, LOG_CHUNK } from '../config.js'
import { withRpcRetry, sleep } from '../retry.js'
import { native18ToBook6, native18Dust } from '../money.js'
import { insertEntries, type EntryRow } from './db.js'

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')

const erc8183Abi = JSON.parse(
  readFileSync(new URL('../../abis/ERC8183.json', import.meta.url), 'utf8').replace(/^﻿/, ''),
) as Abi
// Income-side ledger sources (plan/03-architecture.md). JobCreated carries NO budget;
// PaymentReleased is net of on-chain fees.
const JOB_EVENTS = ['JobFunded', 'PaymentReleased', 'Refunded', 'EvaluatorFeePaid'] as const
const jobEvents = erc8183Abi.filter(e => e.type === 'event' && JOB_EVENTS.includes(e.name as any))

const low = (a: string) => a.toLowerCase()

function* chunks(fromBlock: bigint, toBlock: bigint) {
  for (let start = fromBlock; start <= toBlock; start += LOG_CHUNK) {
    const end = start + LOG_CHUNK - 1n < toBlock ? start + LOG_CHUNK - 1n : toBlock
    yield [start, end] as const
  }
}

// R1: USDC is indexed from the 0xfffe system emitter ONLY (18-dec) — never also 0x3600 logs.
// Every native send, contract value move, and ERC-20 transfer appears exactly once here (R2).
export async function ingestUsdc(
  client: PublicClient, db: Database.Database, watched: Set<string>, fromBlock: bigint, toBlock: bigint,
) {
  const watchedArr = [...watched] as `0x${string}`[]
  let inserted = 0
  for (const [start, end] of chunks(fromBlock, toBlock)) {
    const [outLogs, inLogs] = [
      await withRpcRetry(() => client.getLogs({
        address: ADDRESSES.eip7708Emitter, event: transferEvent,
        args: { from: watchedArr }, fromBlock: start, toBlock: end,
      })),
      await withRpcRetry(() => client.getLogs({
        address: ADDRESSES.eip7708Emitter, event: transferEvent,
        args: { to: watchedArr }, fromBlock: start, toBlock: end,
      })),
    ]
    const seen = new Set<string>()
    const rows: EntryRow[] = []
    for (const l of [...outLogs, ...inLogs]) {
      const key = `${l.transactionHash}:${l.logIndex}`
      if (seen.has(key)) continue
      seen.add(key)
      const from = low(l.args.from!), to = low(l.args.to!), value = l.args.value!
      const base = {
        txHash: l.transactionHash, logIndex: l.logIndex, blockNumber: Number(l.blockNumber),
        kind: 'transfer', amount6: native18ToBook6(value), dustWei: native18Dust(value),
      }
      if (watched.has(from)) rows.push({ ...base, account: from, direction: 'out', counterparty: to })
      if (watched.has(to)) rows.push({ ...base, account: to, direction: 'in', counterparty: from })
    }
    insertEntries(db, rows)
    inserted += rows.length
    await sleep(300)
  }
  return inserted
}

// R3: fees emit no Transfer log — the gas category comes from receipts. Note: Gas Station-
// sponsored SCA txs are paid by the paymaster (receipt payer is the bundler, not the agent),
// so sponsored fleets correctly show no gas lines; unsponsored EOAs do.
export async function ingestGas(
  client: PublicClient, db: Database.Database, watched: Set<string>, maxReceipts = 25,
) {
  const candidates = db.prepare(`
    SELECT DISTINCT txHash, blockNumber FROM entries
    WHERE kind = 'transfer' AND direction = 'out'
      AND txHash NOT IN (SELECT txHash FROM entries WHERE kind = 'gas')
    ORDER BY blockNumber DESC LIMIT ?
  `).all(maxReceipts) as { txHash: string; blockNumber: number }[]

  let inserted = 0
  for (const c of candidates) {
    const receipt = await withRpcRetry(() => client.getTransactionReceipt({ hash: c.txHash as `0x${string}` }))
    const payer = low(receipt.from)
    if (!watched.has(payer)) continue
    const feeWei = receipt.gasUsed * receipt.effectiveGasPrice
    insertEntries(db, [{
      account: payer, txHash: c.txHash, logIndex: -1, blockNumber: Number(receipt.blockNumber),
      kind: 'gas', direction: 'out', amount6: native18ToBook6(feeWei), dustWei: native18Dust(feeWei),
      memo: `gasUsed=${receipt.gasUsed} effectiveGasPrice=${receipt.effectiveGasPrice}`,
    }])
    inserted++
    await sleep(300)
  }
  return inserted
}

// Income side: ERC-8183 job-escrow events for watched clients/providers/evaluators.
// Escrow amounts are 6-dec USDC (ERC-20 view) — no conversion.
export async function ingestJobs(
  client: PublicClient, db: Database.Database, watched: Set<string>, fromBlock: bigint, toBlock: bigint,
) {
  let inserted = 0
  for (const [start, end] of chunks(fromBlock, toBlock)) {
    const logs = await withRpcRetry(() => client.getLogs({
      address: ADDRESSES.erc8183Escrow, events: jobEvents as any, fromBlock: start, toBlock: end,
    }))
    const rows: EntryRow[] = []
    for (const l of logs as any[]) {
      const a = l.args as Record<string, unknown>
      const jobId = a.jobId as bigint
      const amount = a.amount as bigint
      const party = low((a.client ?? a.provider ?? a.evaluator) as string)
      if (!watched.has(party)) continue
      // JobFunded = money out of the client into escrow; PaymentReleased/EvaluatorFeePaid = income; Refunded = money back.
      const direction = l.eventName === 'JobFunded' ? 'out' : 'in'
      rows.push({
        account: party, txHash: l.transactionHash, logIndex: l.logIndex, blockNumber: Number(l.blockNumber),
        kind: `job:${l.eventName}`, direction, amount6: amount, counterparty: ADDRESSES.erc8183Escrow,
        memo: `jobId=${jobId}`,
      })
    }
    insertEntries(db, rows)
    inserted += rows.length
    await sleep(300)
  }
  return inserted
}
