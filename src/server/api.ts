// Bailey's API — serves the real ledger (bailey.db) to the web frontend, plus the built
// site from web/dist in production. Zero framework: node:http + better-sqlite3.
// Usage: npm run api   (port 8787; vite dev proxies /api here)
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { openLedger } from '../indexer/db.js'

const db = openLedger()
const PORT = Number(process.env.PORT ?? 8787)
const DIST = 'web/dist'
const MIME: Record<string, string> = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
}

function summary() {
  const t = db.prepare(`
    SELECT COUNT(*) AS entries,
           COALESCE(SUM(CASE WHEN direction = 'in' THEN amount6 END), 0) AS in6,
           COALESCE(SUM(CASE WHEN direction = 'out' AND kind != 'gas' THEN amount6 END), 0) AS out6,
           COALESCE(SUM(CASE WHEN kind = 'gas' THEN amount6 END), 0) AS gas6
    FROM entries
  `).get() as { entries: number; in6: number; out6: number; gas6: number }
  const accounts = (db.prepare('SELECT COUNT(*) AS n FROM accounts').get() as { n: number }).n
  const head = (db.prepare("SELECT lastBlock FROM cursors WHERE name = 'main'").get() as { lastBlock: number } | undefined)?.lastBlock
    ?? (db.prepare('SELECT MAX(blockNumber) AS b FROM entries').get() as { b: number }).b
  return { headBlock: head, accounts, entries: t.entries, in6: t.in6, out6: t.out6, gas6: t.gas6, net6: t.in6 - t.out6 - t.gas6 }
}

function accounts() {
  return db.prepare(`
    SELECT a.address, a.label, a.role,
           COALESCE(SUM(CASE WHEN e.direction = 'in' THEN e.amount6 ELSE -e.amount6 END), 0) AS balance6,
           COALESCE(SUM(CASE WHEN e.direction = 'in' THEN 1 ELSE 0 END), 0) AS inN,
           COALESCE(SUM(CASE WHEN e.direction = 'out' THEN 1 ELSE 0 END), 0) AS outN
    FROM accounts a LEFT JOIN entries e ON e.account = a.address
    GROUP BY a.address ORDER BY a.role, a.label
  `).all()
}

function entries(limit: number) {
  const labels = new Map(
    (db.prepare('SELECT address, label FROM accounts').all() as { address: string; label: string }[])
      .map(r => [r.address, r.label]),
  )
  const rows = db.prepare(`
    SELECT e.id, e.blockNumber, b.ts, e.txHash, e.kind, e.direction, e.account, e.counterparty,
           e.amount6, e.category, e.confidence, e.memo, a.label AS accountLabel
    FROM entries e
    JOIN accounts a ON a.address = e.account
    LEFT JOIN blocks b ON b.blockNumber = e.blockNumber
    ORDER BY e.blockNumber DESC, e.logIndex DESC LIMIT ?
  `).all(limit) as any[]
  for (const r of rows) {
    r.counterpartyLabel = r.counterparty === '0x0000000000000000000000000000000000000000'
      ? 'mint' : (labels.get(r.counterparty) ?? 'external')
    delete r.account
    delete r.counterparty
  }
  return rows
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    if (url.pathname === '/api/summary') {
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(summary())); return
    }
    if (url.pathname === '/api/accounts') {
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(accounts())); return
    }
    if (url.pathname === '/api/entries') {
      const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 50))
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(entries(limit))); return
    }
    // static: built site
    if (existsSync(DIST)) {
      let p = join(DIST, url.pathname === '/' ? 'index.html' : url.pathname)
      if (!existsSync(p)) p = join(DIST, 'index.html')
      res.setHeader('Content-Type', MIME[extname(p)] ?? 'application/octet-stream')
      res.end(readFileSync(p))
      return
    }
    res.statusCode = 404; res.end('not found (build the site: npm run web:build)')
  } catch (err) {
    res.statusCode = 500; res.end(String(err))
  }
})

server.listen(PORT, () => console.log(`bailey api + site on http://localhost:${PORT}`))
