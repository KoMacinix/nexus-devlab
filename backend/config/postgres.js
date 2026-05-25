const { Pool } = require("pg");

let pool;

async function connectPostgres() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Créer les tables si elles n'existent pas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id            SERIAL PRIMARY KEY,
      name          TEXT    NOT NULL,
      description   TEXT    DEFAULT '',
      product_type  TEXT    DEFAULT '',
      quantity      INTEGER DEFAULT 0,
      min_threshold INTEGER DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_products (
      id          SERIAL PRIMARY KEY,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      price       REAL    DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_clients (
      id              SERIAL PRIMARY KEY,
      nom             TEXT NOT NULL,
      prenom          TEXT NOT NULL,
      telephone       TEXT NOT NULL,
      date_naissance  TEXT DEFAULT '',
      adresse         TEXT DEFAULT ''
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_commandes (
      id              SERIAL PRIMARY KEY,
      client_id       INTEGER NOT NULL REFERENCES ticket_clients(id),
      type_billet     TEXT    NOT NULL,
      nombre_billets  INTEGER DEFAULT 1,
      date_commande   TEXT    DEFAULT ''
    )
  `);

  console.log("✅ PostgreSQL connecté (Neon)");
  return pool;
}

function getPool() {
  if (!pool) throw new Error("PostgreSQL non initialisé — appeler connectPostgres() d'abord");
  return pool;
}

module.exports = { connectPostgres, getPool };
