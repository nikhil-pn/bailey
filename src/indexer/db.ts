import Database from 'better-sqlite3'

// The ledger. Amounts are stored at 6 decimals (the book view, R4 in docs/spike-eip7708.md);
// the sub-micro remainder of the 18-dec native view is kept in dustWei, never booked.
// (account, txHash, logIndex, kind) is unique so re-ingesting a range is idempotent.
export function openLedger(path = 'bailey.db') {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      address TEXT PRIMARY KEY,
      label   TEXT,
      role    TEXT NOT NULL DEFAULT 'agent' -- agent | banker | treasury | external
    );
    CREATE TABLE IF NOT EXISTS entries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      account     TEXT NOT NULL,
      txHash      TEXT NOT NULL,
      logIndex    INTEGER NOT NULL,           -- -1 for receipt-derived rows (gas)
      blockNumber INTEGER NOT NULL,
      kind        TEXT NOT NULL,              -- transfer | gas | job:JobFunded | job:PaymentReleased | ...
      direction   TEXT NOT NULL,              -- in | out | info
      counterparty TEXT,
      asset       TEXT NOT NULL DEFAULT 'USDC',
      amount6     INTEGER NOT NULL,
      dustWei     TEXT NOT NULL DEFAULT '0',
      category    TEXT,                       -- set by the AI bookkeeper
      confidence  REAL,
      memo        TEXT,
      UNIQUE(account, txHash, logIndex, kind)
    );
    CREATE INDEX IF NOT EXISTS idx_entries_account_block ON entries(account, blockNumber, logIndex);
    CREATE TABLE IF NOT EXISTS cursors (name TEXT PRIMARY KEY, lastBlock INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS blocks (blockNumber INTEGER PRIMARY KEY, ts INTEGER NOT NULL);
  `)
  return db
}

export interface EntryRow {
  account: string
  txHash: string
  logIndex: number
  blockNumber: number
  kind: string
  direction: 'in' | 'out' | 'info'
  counterparty?: string
  asset?: string
  amount6: bigint
  dustWei?: bigint
  memo?: string
}

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER)

export function insertEntries(db: Database.Database, rows: EntryRow[]) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO entries
      (account, txHash, logIndex, blockNumber, kind, direction, counterparty, asset, amount6, dustWei, memo)
    VALUES
      (@account, @txHash, @logIndex, @blockNumber, @kind, @direction, @counterparty, @asset, @amount6, @dustWei, @memo)
  `)
  const insertMany = db.transaction((rs: EntryRow[]) => {
    for (const r of rs) {
      if (r.amount6 > MAX_SAFE) throw new Error(`amount6 overflow on ${r.txHash}: ${r.amount6}`)
      stmt.run({
        ...r,
        counterparty: r.counterparty ?? null,
        asset: r.asset ?? 'USDC',
        amount6: Number(r.amount6),
        dustWei: (r.dustWei ?? 0n).toString(),
        memo: r.memo ?? null,
      })
    }
  })
  insertMany(rows)
}

export function upsertAccount(db: Database.Database, address: string, label: string, role = 'agent') {
  db.prepare(`INSERT INTO accounts(address, label, role) VALUES (?, ?, ?)
              ON CONFLICT(address) DO UPDATE SET label = excluded.label, role = excluded.role`)
    .run(address.toLowerCase(), label, role)
}
