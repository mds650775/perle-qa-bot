const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Always store DB locally inside project
const DB_PATH = path.join(__dirname, "feedback.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("[DB] Failed to connect:", err.message);
  } else {
    console.log("[DB] Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT,
      user TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, () => {
    console.log("[DB] Feedback table ready");
  });
});

module.exports = db;
