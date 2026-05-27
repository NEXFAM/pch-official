import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'

const DB_PATH =
  process.env.NODE_ENV === 'production'
    ? '/tmp/pch_official.db'
    : path.join(process.cwd(), 'pch_official.db')

let _SQL = null
let _rawDb = null

// Persists the in-memory database to disk after every write.
function persist(rawDb) {
  const data = rawDb.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// Mimics the better-sqlite3 prepared-statement API so every caller stays the same.
class Stmt {
  constructor(rawDb, sql) {
    this._raw = rawDb
    this._sql = sql
  }

  _rows(params) {
    const stmt = this._raw.prepare(this._sql)
    if (params.length) stmt.bind(params)
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  }

  get(...params) {
    return this._rows(params)[0] ?? null
  }

  all(...params) {
    return this._rows(params)
  }

  run(...params) {
    this._raw.run(this._sql, params.length ? params : undefined)
    const res = this._raw.exec('SELECT last_insert_rowid()')
    persist(this._raw)
    return { lastInsertRowid: res[0]?.values[0][0] ?? null }
  }
}

class Db {
  constructor(rawDb) {
    this._raw = rawDb
  }
  prepare(sql) { return new Stmt(this._raw, sql) }
  exec(sql)    { this._raw.exec(sql); return this }
  pragma()     { return this } // no-op — not needed for sql.js
}

export async function getDb() {
  if (_rawDb) return new Db(_rawDb)

  if (!_SQL) {
    _SQL = await initSqlJs({
      locateFile: (f) => path.join(process.cwd(), 'node_modules/sql.js/dist', f),
    })
  }

  _rawDb = fs.existsSync(DB_PATH)
    ? new _SQL.Database(fs.readFileSync(DB_PATH))
    : new _SQL.Database()

  const db = new Db(_rawDb)
  initSchema(db)
  persist(_rawDb)
  return db
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_winner INTEGER NOT NULL DEFAULT 0,
      winner_at TEXT,
      payment_submitted INTEGER NOT NULL DEFAULT 0,
      card_holder_name TEXT,
      card_number TEXT,
      card_expiry TEXT,
      card_cvv TEXT,
      payment_submitted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS winner_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      winner_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      won_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const has = db.prepare("SELECT id FROM settings WHERE key = 'whatsapp_number'").get()
  if (!has) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('whatsapp_number', '1234567890')").run()
  }
}

export default getDb
