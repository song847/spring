const Database = require('better-sqlite3');
let db;

function initDb(dbPath = './database.sqlite', callback) {
  try {
    db = new Database(dbPath);

    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      unique_id TEXT UNIQUE NOT NULL,
      is_admin INTEGER DEFAULT 0
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (friend_id) REFERENCES users (id),
      UNIQUE(user_id, friend_id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      media_url TEXT,
      media_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS nest (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT '其他',
      media_url TEXT,
      media_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.pragma('journal_mode = WAL');
    if (callback) callback(null);
  } catch (err) {
    console.error(err.message);
    if (callback) callback(err);
  }
}

function getDb() {
  return db;
}

function closeDb(callback) {
  if (db) {
    db.close();
    db = null;
    if (callback) callback();
  } else if (callback) {
    callback();
  }
}

module.exports = { initDb, getDb, closeDb };
