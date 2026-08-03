// Statement engine: renders a per-account bank statement + CSV from the ledger.
// This is the deterministic core of the month-end close — the AI bookkeeper only fills the
// Category/Confidence columns and writes the plain-English summary; every number comes from
// the indexed chain data, never from a model. Usage:
//   npm run statement -- [--db bailey.db] [--out statements]
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { openLedger } from '../indexer/db.js'
import { formatBook6 } from '../money.js'

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

interface Line {
  blockNumber: number
  logIndex: number
  ts: number | null
  txHash: string
  kind: string
  direction: 'in' | 'out' | 'info'
  counterparty: string | null
  amount6: number
  category: string | null
  confidence: number | null
  memo: string | null
}

const iso = (ts: number | null) => (ts ? new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : '')
const csvEscape = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)

function main() {
  const db = openLedger(arg('db', 'bailey.db'))
  const outDir = arg('out', 'statements')
  mkdirSync(outDir, { recursive: true })

  const accounts = db.prepare('SELECT address, label, role FROM accounts ORDER BY label')
    .all() as { address: string; label: string; role: string }[]
  const fleet = { in6: 0n, out6: 0n, gas6: 0n, lines: 0 }

  for (const acct of accounts) {
    const lines = db.prepare(`
      SELECT e.blockNumber, e.logIndex, b.ts, e.txHash, e.kind, e.direction, e.counterparty,
             e.amount6, e.category, e.confidence, e.memo
      FROM entries e LEFT JOIN blocks b ON b.blockNumber = e.blockNumber
      WHERE e.account = ? ORDER BY e.blockNumber, e.logIndex
    `).all(acct.address) as Line[]
    if (lines.length === 0) continue

    let balance = 0n
    const totals = { in6: 0n, out6: 0n, gas6: 0n }
    const csv = ['Date,Block,Ref,Type,Category,Description,Amount USDC,Balance USDC']
    for (const l of lines) {
      const amt = BigInt(l.amount6)
      const signed = l.direction === 'in' ? amt : -amt
      balance += signed
      if (l.kind === 'gas') totals.gas6 += amt
      else if (l.direction === 'in') totals.in6 += amt
      else totals.out6 += amt
      const desc = l.kind === 'gas'
        ? 'network gas'
        : `${l.kind.startsWith('job:') ? l.kind.slice(4) : 'USDC transfer'} ${l.direction === 'in' ? 'from' : 'to'} ${l.counterparty ?? '?'}${l.memo ? ` (${l.memo})` : ''}`
      const amountStr = (l.direction === 'in' ? '' : '-') + formatBook6(amt).replace(' USDC', '')
      csv.push([
        iso(l.ts), String(l.blockNumber), l.txHash, l.kind, l.category ?? 'uncategorized',
        csvEscape(desc), amountStr, formatBook6(balance).replace(' USDC', ''),
      ].join(','))
    }

    const file = join(outDir, `${acct.label}.csv`)
    writeFileSync(file, csv.join('\n') + '\n')
    fleet.in6 += totals.in6; fleet.out6 += totals.out6; fleet.gas6 += totals.gas6; fleet.lines += lines.length

    const period = `${lines[0].blockNumber} → ${lines[lines.length - 1].blockNumber}`
    console.log(`\n── ${acct.label} (${acct.role}) · ${acct.address}`)
    console.log(`   period (blocks): ${period} · ${lines.length} lines · ${file}`)
    console.log(`   money in : ${formatBook6(totals.in6)}`)
    console.log(`   money out: ${formatBook6(totals.out6)}${totals.gas6 > 0n ? `  (+ gas ${formatBook6(totals.gas6)})` : ''}`)
    console.log(`   net      : ${formatBook6(totals.in6 - totals.out6 - totals.gas6)}`)
    const byCat = db.prepare(`
      SELECT COALESCE(category, 'uncategorized') AS cat,
             SUM(CASE WHEN direction = 'in' THEN amount6 ELSE -amount6 END) AS net6, COUNT(*) AS n
      FROM entries WHERE account = ? GROUP BY cat ORDER BY net6 DESC
    `).all(acct.address) as { cat: string; net6: number; n: number }[]
    for (const c of byCat) {
      const sign = c.net6 >= 0 ? '+' : ''
      console.log(`     ${c.cat.padEnd(22)} ${sign}${formatBook6(BigInt(c.net6))}  (×${c.n})`)
    }
    const uncategorized = lines.filter(l => !l.category).length
    if (uncategorized) console.log(`   bookkeeper: ${uncategorized}/${lines.length} lines await categorization`)
  }

  console.log(`\n══ FLEET ROLL-UP ═══════════════════════════════`)
  console.log(`   accounts: ${accounts.length} · lines: ${fleet.lines}`)
  console.log(`   in ${formatBook6(fleet.in6)} · out ${formatBook6(fleet.out6)} · gas ${formatBook6(fleet.gas6)}`)
  console.log(`   net ${formatBook6(fleet.in6 - fleet.out6 - fleet.gas6)}`)
}

main()
