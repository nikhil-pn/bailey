// The bookkeeper run: (1) enrich transfer lines with Circle refIds (List-Transactions API —
// the off-chain context joined to on-chain truth by txHash), (2) apply deterministic rules,
// (3) LLM-categorize the remaining transfer lines (only with a golden-set-passed model),
// (4) low-confidence lines stay uncategorized — escalation, not guessing.
// Usage: npm run bookkeeper
import { createRequire } from 'node:module'
import { loadEnv, requireEnv } from '../env.js'
import { openLedger } from '../indexer/db.js'
import { DETERMINISTIC, type LineInput } from './categories.js'
import { categorizeLine } from './llm.js'
import { sleep } from '../retry.js'

const require = createRequire(import.meta.url)
const { initiateDeveloperControlledWalletsClient } =
  require('@circle-fin/developer-controlled-wallets') as typeof import('@circle-fin/developer-controlled-wallets')

const CONFIDENCE_FLOOR = 0.6
const ZERO = '0x0000000000000000000000000000000000000000'

async function main() {
  loadEnv()
  const db = openLedger()

  // 1. refId enrichment via Circle List-Transactions
  const circle = initiateDeveloperControlledWalletsClient({
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
  })
  const listRes = await circle.listTransactions({ blockchain: 'ARC-TESTNET', pageSize: 50 })
  const txs = listRes.data?.transactions ?? []
  // refId is omitted from the list view — fetch detail per OUTBOUND transfer (the sender's
  // record carries it); one refId covers both sides of the movement via the shared txHash.
  const refByHash = new Map<string, string>()
  for (const t of txs) {
    if (t.transactionType !== 'OUTBOUND' || !t.txHash) continue
    const d = await circle.getTransaction({ id: t.id })
    const refId = d.data?.transaction?.refId
    if (refId) refByHash.set(t.txHash.toLowerCase(), refId)
    await sleep(400)
  }
  const setMemo = db.prepare(`UPDATE entries SET memo = ? WHERE txHash = ? AND kind = 'transfer' AND (memo IS NULL OR memo = '')`)
  let enriched = 0
  for (const [hash, refId] of refByHash) enriched += setMemo.run(refId, hash).changes
  console.log(`refId enrichment: ${refByHash.size} Circle txs with refIds -> ${enriched} ledger lines enriched`)

  // 2. deterministic rules (chain-structural kinds never see the model)
  const det = db.prepare(`UPDATE entries SET category = ?, confidence = 1.0 WHERE kind = ? AND category IS NULL`)
  for (const [kind, category] of Object.entries(DETERMINISTIC)) {
    const n = det.run(category, kind).changes
    if (n) console.log(`deterministic: ${n} × ${kind} -> ${category}`)
  }

  // 3. LLM categorization for transfer lines
  const model = process.env.BOOKKEEPER_MODEL ?? 'deepseek/deepseek-chat'
  const orKey = requireEnv('OPENROUTER_API_KEY')
  const labels = new Map(
    (db.prepare('SELECT address, label FROM accounts').all() as { address: string; label: string }[])
      .map(r => [r.address, r.label]),
  )
  const pending = db.prepare(`
    SELECT id, direction, counterparty, amount6, memo FROM entries
    WHERE kind = 'transfer' AND category IS NULL ORDER BY blockNumber, logIndex
  `).all() as { id: number; direction: 'in' | 'out'; counterparty: string | null; amount6: number; memo: string | null }[]
  console.log(`\nLLM (${model}) categorizing ${pending.length} transfer lines…`)

  const save = db.prepare('UPDATE entries SET category = ?, confidence = ? WHERE id = ?')
  let escalated = 0
  for (const p of pending) {
    const cp = p.counterparty === ZERO ? 'zero-address (mint)' : (labels.get(p.counterparty ?? '') ?? 'external')
    const line: LineInput = {
      direction: p.direction,
      amountUsdc: (p.amount6 / 1_000_000).toFixed(6),
      counterparty: cp,
      refId: p.memo || null,
    }
    const v = await categorizeLine(model, orKey, line)
    if (v.confidence >= CONFIDENCE_FLOOR && v.category !== 'unknown') {
      save.run(v.category, v.confidence, p.id)
      console.log(`  #${p.id} ${p.direction.padEnd(3)} ${line.amountUsdc.padStart(12)} ${cp.padEnd(14)} ${line.refId ?? '—'} -> ${v.category} (${v.confidence.toFixed(2)})`)
    } else {
      escalated++
      console.log(`  #${p.id} ${p.direction.padEnd(3)} ${line.amountUsdc.padStart(12)} ${cp.padEnd(14)} ${line.refId ?? '—'} -> ESCALATED (${v.category} @ ${v.confidence.toFixed(2)})`)
    }
    await sleep(600)
  }
  console.log(`\ndone. escalated (left uncategorized for review): ${escalated}`)
}

main().catch(err => { console.error('bookkeeper failed:', err); process.exit(1) })
