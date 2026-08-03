// One-off: removes the read-only smoke-test sample accounts from the ledger.
const Database = require('better-sqlite3')
const db = new Database('bailey.db')
const e = db.prepare("DELETE FROM entries WHERE account IN (SELECT address FROM accounts WHERE role='external')").run()
const a = db.prepare("DELETE FROM accounts WHERE role='external'").run()
console.log(`removed ${a.changes} sample accounts and ${e.changes} entries`)
