// The gate: a model may only be seated as Bailey's categorizer if it passes the golden set —
// every critical case correct AND >= 11/12 overall. Re-run on every model swap or prompt change.
// Usage: npm run bookkeeper:eval [-- <model>]   (default: BOOKKEEPER_MODEL from .env)
import { appendFileSync, existsSync, writeFileSync } from 'node:fs'
import { loadEnv, requireEnv } from '../env.js'
import { categorizeLine } from './llm.js'
import { GOLDEN } from './golden.js'
import { sleep } from '../retry.js'

const RESULTS_FILE = 'docs/bookkeeper-eval.md'

async function main() {
  loadEnv()
  const apiKey = requireEnv('OPENROUTER_API_KEY')
  const model = process.argv[2] ?? process.env.BOOKKEEPER_MODEL ?? 'deepseek/deepseek-chat'
  console.log(`evaluating ${model} against ${GOLDEN.length} golden cases…\n`)

  let correct = 0, criticalWrong = 0
  const rows: string[] = []
  for (const c of GOLDEN) {
    const v = await categorizeLine(model, apiKey, c.input)
    const ok = c.allowed.includes(v.category)
    if (ok) correct++
    else if (c.critical) criticalWrong++
    const mark = ok ? '✓' : (c.critical ? '✗ CRITICAL' : '✗')
    console.log(`${mark.padEnd(11)} ${c.name.padEnd(32)} -> ${v.category} (${v.confidence.toFixed(2)})${ok ? '' : `  expected ${c.allowed.join(' | ')}`}`)
    rows.push(`| ${c.name} | ${c.allowed.join(' / ')} | ${v.category} | ${v.confidence.toFixed(2)} | ${ok ? '✓' : '✗'} |`)
    await sleep(600)
  }

  const pass = criticalWrong === 0 && correct >= GOLDEN.length - 1
  console.log(`\n${model}: ${correct}/${GOLDEN.length} correct, ${criticalWrong} critical misses -> ${pass ? 'PASS — model may be seated' : 'FAIL — model may NOT categorize production ledgers'}`)

  const md = `\n## ${model} — ${correct}/${GOLDEN.length} ${pass ? 'PASS' : 'FAIL'} (${new Date().toISOString().slice(0, 10)})\n\n| Case | Expected | Got | Conf | OK |\n|---|---|---|---|---|\n${rows.join('\n')}\n`
  if (!existsSync(RESULTS_FILE)) {
    writeFileSync(RESULTS_FILE, `# Bailey bookkeeper — golden-set eval results\n\nGate: all critical cases correct AND ≥ ${GOLDEN.length - 1}/${GOLDEN.length} overall. A model that fails may not categorize production ledgers. Re-run on every model swap or prompt change.\n`)
  }
  appendFileSync(RESULTS_FILE, md)
  console.log(`results appended to ${RESULTS_FILE}`)
  if (!pass) process.exit(1)
}

main().catch(err => { console.error('eval failed:', err); process.exit(1) })
