const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "inventory.db");

let db;

function connectSQLite() {
  const fs = require("fs");
  const dir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Table StockOS — inventaire (projet Inventaire)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      description   TEXT    DEFAULT '',
      product_type  TEXT    DEFAULT '',
      quantity      INTEGER DEFAULT 0,
      min_threshold INTEGER DEFAULT 0
    )
  `);

  // Table Forge — produits Laravel (projet htdocs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      price       REAL    DEFAULT 0
    )
  `);

  // Table ShowPass — clients (projet TicketConcert)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_clients (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nom             TEXT NOT NULL,
      prenom          TEXT NOT NULL,
      telephone       TEXT NOT NULL,
      date_naissance  TEXT DEFAULT '',
      adresse         TEXT DEFAULT ''
    )
  `);

  // Table ShowPass — commandes (projet TicketConcert)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_commandes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id       INTEGER NOT NULL,
      type_billet     TEXT    NOT NULL,
      nombre_billets  INTEGER DEFAULT 1,
      date_commande   TEXT    DEFAULT '',
      FOREIGN KEY (client_id) REFERENCES ticket_clients(id)
    )
  `);

  console.log("✅ SQLite connecté (" + dbPath + ")");
  return db;
}

function getDB() {
  if (!db) throw new Error("SQLite non initialisé — appeler connectSQLite() d'abord");
  return db;
}

module.exports = { connectSQLite, getDB };
