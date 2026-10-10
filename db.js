const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const filename = path.resolve(process.env.DATABASE_PATH || "./data/internships.sqlite");
fs.mkdirSync(path.dirname(filename), { recursive: true });
const db = new Database(filename);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS internships (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 3 AND 120),
 company TEXT NOT NULL CHECK(length(trim(company)) BETWEEN 2 AND 100),
 domain TEXT NOT NULL CHECK(domain IN ('Technology','Data','Design','Marketing','Business')),
 description TEXT NOT NULL CHECK(length(trim(description)) BETWEEN 10 AND 1000),
 location TEXT NOT NULL CHECK(length(trim(location)) BETWEEN 2 AND 100),
 mode TEXT NOT NULL CHECK(mode IN ('Remote','Hybrid','On-site')),
 duration TEXT NOT NULL CHECK(length(trim(duration)) BETWEEN 2 AND 60),
 stipend TEXT NOT NULL CHECK(length(trim(stipend)) BETWEEN 2 AND 80),
 skills TEXT NOT NULL DEFAULT '[]',
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);`);
module.exports = db;
