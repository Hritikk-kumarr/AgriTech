const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`CREATE TABLE IF NOT EXISTS users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       username TEXT NOT NULL UNIQUE,
       password_hash TEXT NOT NULL,
       role TEXT NOT NULL CHECK(role IN ('farmer','retailer','admin')),
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS retailers (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       user_id INTEGER REFERENCES users(id),
       name TEXT NOT NULL,
       location TEXT NOT NULL,
       pin_code TEXT NOT NULL,
       license_number TEXT NOT NULL UNIQUE,
       allotted_quantity INTEGER NOT NULL DEFAULT 0,
       current_stock INTEGER NOT NULL DEFAULT 0,
       trust_score INTEGER NOT NULL DEFAULT 100,
       season TEXT NOT NULL DEFAULT '2024-Kharif'
       )`);

    db.run(`CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      aadhaar_hash TEXT NOT NULL UNIQUE,
      mobile_last4 TEXT NOT NULL,
      land_size_acres REAL NOT NULL,
      khasra_id TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      retailer_id INTEGER NOT NULL REFERENCES retailers(id),
      farmer_id INTEGER NOT NULL REFERENCES farmers(id),
      requested_bags INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','VERIFIED','REJECTED')),
      block_hash TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS declarations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      retailer_id INTEGER NOT NULL REFERENCES retailers(id),
      declared_stock INTEGER NOT NULL,
      expected_stock INTEGER NOT NULL,
      discrepancy INTEGER NOT NULL DEFAULT 0,
      is_flagged INTEGER NOT NULL DEFAULT 0,
      photo_placeholder TEXT,
      geo_tag TEXT,
      block_hash TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS audit_chain (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_index INTEGER NOT NULL,
      prev_hash TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL,
      data_hash TEXT NOT NULL,
      block_hash TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

const dbRun = (sql, params = []) => new Promise((res, rej) =>
    db.run(sql, params, function (err) { err ? rej(err) : res(this); }));
const dbGet = (sql, params = []) => new Promise((res, rej) =>
    db.get(sql, params, (err, row) => { err ? rej(err) : res(row); }));
const dbAll = (sql, params = []) => new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => { err ? rej(err) : res(rows); }));

module.exports = { db, dbRun, dbGet, dbAll };