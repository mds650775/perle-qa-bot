const sqlite3 = require("sqlite3").verbose();
const { CONFIG } = require("./config");

// Open database (creates file if it doesn't exist)
const db = new sqlite3.Database(CONFIG.SQLITE_DB, (err) => {
  if (err) {
    console.error("[DB ERROR] Could not open database:", err.message);
  } else {
    console.log("[DB] Connected to SQLite database");
  }
});

// Initialize table
function initDB() {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      answer TEXT,
      rating INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("[DB INIT ERROR]", err.message);
      } else {
        console.log("[DB] Feedback table ready");
      }
    }
  );
}

// Save feedback
function saveFeedback({ question, answer, rating }) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO feedback (question, answer, rating) VALUES (?, ?, ?)`,
      [question, answer, rating],
      (err) => {
        if (err) {
          console.error("[DB SAVE ERROR]", err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

initDB();

module.exports = {
  saveFeedback
};
