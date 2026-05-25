/**
 * seed.js — Insère les données initiales dans MongoDB + SQLite.
 *
 * Usage : node seed.js
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const User = require("./models/User");
const Question = require("./models/Question");
const Player = require("./models/Player");
const Game = require("./models/Game");

async function seed() {
  // ── 1. MongoDB ──
  console.log("⏳ Connexion MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connecté");

  // Nettoyer
  await User.deleteMany({});
  await Question.deleteMany({});
  await Player.deleteMany({});
  await Game.deleteMany({});
  console.log("🗑️  Collections vidées");

  // User démo
  const hash = await bcrypt.hash("123456", 10);
  await User.create({
    name: "Ko",
    email: "demo@nexus.dev",
    password: hash,
  });
  console.log("👤 Utilisateur démo créé : demo@nexus.dev / 123456");

  // Questions du quiz
  await Question.insertMany([
    { text: "La capitale du Canada est Ottawa ?", correctAnswer: "vrai" },
    { text: "L'élément chimique Fe est le cuivre ?", correctAnswer: "faux" },
    { text: "La Première Guerre mondiale a commencé en 1914 ?", correctAnswer: "vrai" },
    { text: "L'océan le plus vaste du monde est l'Atlantique ?", correctAnswer: "faux" },
    { text: "Shakespeare a écrit Roméo et Juliette ?", correctAnswer: "vrai" },
    { text: "La lumière voyage plus vite que le son ?", correctAnswer: "vrai" },
    { text: "Le Sahara est le plus grand désert du monde ?", correctAnswer: "vrai" },
    { text: "Python est un langage compilé ?", correctAnswer: "faux" },
    { text: "HTTP utilise le port 443 par défaut ?", correctAnswer: "faux" },
    { text: "MongoDB est une base de données NoSQL ?", correctAnswer: "vrai" },
  ]);
  console.log("❓ 10 questions insérées");

  // ── 2. SQLite ──
  console.log("\n⏳ Initialisation SQLite...");
  const dir = path.join(__dirname, "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const Database = require("better-sqlite3");
  const db = new Database(path.join(dir, "inventory.db"));
  db.pragma("journal_mode = WAL");

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

  // Nettoyer puis insérer
  db.exec("DELETE FROM products");

  const insert = db.prepare(
    "INSERT INTO products (name, description, product_type, quantity, min_threshold) VALUES (?, ?, ?, ?, ?)"
  );

  const products = [
    ["Clavier mécanique", "Cherry MX Blue", "Périphérique", 12, 5],
    ["Câble Ethernet Cat6", "3 mètres", "Réseau", 2, 10],
    ["Écran 27\" 4K", "IPS, 60Hz", "Affichage", 8, 3],
    ["Souris sans fil", "Logitech G305", "Périphérique", 15, 5],
    ["SSD NVMe 1To", "Samsung 980 Pro", "Stockage", 1, 4],
    ["Webcam HD", "1080p, micro intégré", "Périphérique", 6, 3],
    ["Routeur Wi-Fi 6", "TP-Link AX3000", "Réseau", 3, 2],
    ["RAM DDR5 16Go", "5600MHz", "Composant", 0, 5],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(...item);
  });
  insertMany(products);

  console.log(`📦 ${products.length} produits insérés dans SQLite`);

  // ── 3. Forge — store_products (projet htdocs/Laravel) ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      price       REAL    DEFAULT 0
    )
  `);
  db.exec("DELETE FROM store_products");

  const insertStore = db.prepare(
    "INSERT INTO store_products (name, description, price) VALUES (?, ?, ?)"
  );
  const storeProducts = [
    ["Chocolat Noir 85%", "Tablette bio équitable 100g", 4.99],
    ["Café Arabica", "Grains torréfiés, Colombie, 500g", 12.50],
    ["Thé Matcha", "Poudre premium, Japon, 50g", 18.00],
    ["Miel de Lavande", "Récolte artisanale, Provence, 250g", 8.75],
    ["Huile d'Olive Extra Vierge", "Pressée à froid, Italie, 500ml", 15.90],
  ];
  const insertStoreMany = db.transaction((items) => {
    for (const item of items) insertStore.run(...item);
  });
  insertStoreMany(storeProducts);
  console.log(`🛒 ${storeProducts.length} produits Forge insérés`);

  // ── 4. ShowPass — ticket_clients + ticket_commandes (projet TicketConcert) ──
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
  db.exec("DELETE FROM ticket_commandes");
  db.exec("DELETE FROM ticket_clients");

  const insertClient = db.prepare(
    "INSERT INTO ticket_clients (nom, prenom, telephone, date_naissance, adresse) VALUES (?, ?, ?, ?, ?)"
  );
  const insertCommande = db.prepare(
    "INSERT INTO ticket_commandes (client_id, type_billet, nombre_billets, date_commande) VALUES (?, ?, ?, ?)"
  );

  const c1 = insertClient.run("Benlamara", "Ko", "613-555-0101", "1998-05-15", "123 Rue Principale, Ottawa");
  insertCommande.run(c1.lastInsertRowid, "VIP", 2, new Date().toISOString());
  const c2 = insertClient.run("Tremblay", "Marie", "514-555-0202", "1995-11-20", "456 Av. des Pins, Montréal");
  insertCommande.run(c2.lastInsertRowid, "Standard", 4, new Date().toISOString());

  console.log("🎫 2 clients + 2 commandes ShowPass insérés");

  db.close();

  // ── Fin ──
  await mongoose.connection.close();
  console.log("\n🎉 Seed terminé avec succès !");
}

seed().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
