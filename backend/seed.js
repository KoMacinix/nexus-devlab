/**
 * seed.js — Insère les données initiales dans MongoDB + PostgreSQL (Neon).
 *
 * Usage : node seed.js
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Question = require("./models/Question");
const Player = require("./models/Player");
const Game = require("./models/Game");

const { connectPostgres, getPool } = require("./config/postgres");

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

  // ── 2. PostgreSQL (Neon) ──
  console.log("\n⏳ Connexion PostgreSQL (Neon)...");
  await connectPostgres();
  const pool = getPool();

  // ── StockOS — products ──
  await pool.query("DELETE FROM products");
  const products = [
    ["Clavier mécanique", "Cherry MX Blue", "Périphérique", 12, 5],
    ["Câble Ethernet Cat6", "3 mètres", "Réseau", 2, 10],
    ['Écran 27" 4K', "IPS, 60Hz", "Affichage", 8, 3],
    ["Souris sans fil", "Logitech G305", "Périphérique", 15, 5],
    ["SSD NVMe 1To", "Samsung 980 Pro", "Stockage", 1, 4],
    ["Webcam HD", "1080p, micro intégré", "Périphérique", 6, 3],
    ["Routeur Wi-Fi 6", "TP-Link AX3000", "Réseau", 3, 2],
    ["RAM DDR5 16Go", "5600MHz", "Composant", 0, 5],
  ];
  for (const [name, description, product_type, quantity, min_threshold] of products) {
    await pool.query(
      "INSERT INTO products (name, description, product_type, quantity, min_threshold) VALUES ($1,$2,$3,$4,$5)",
      [name, description, product_type, quantity, min_threshold]
    );
  }
  console.log(`📦 ${products.length} produits StockOS insérés`);

  // ── Forge — store_products ──
  await pool.query("DELETE FROM store_products");
  const storeProducts = [
    ["Chocolat Noir 85%", "Tablette bio équitable 100g", 4.99],
    ["Café Arabica", "Grains torréfiés, Colombie, 500g", 12.5],
    ["Thé Matcha", "Poudre premium, Japon, 50g", 18.0],
    ["Miel de Lavande", "Récolte artisanale, Provence, 250g", 8.75],
    ["Huile d'Olive Extra Vierge", "Pressée à froid, Italie, 500ml", 15.9],
  ];
  for (const [name, description, price] of storeProducts) {
    await pool.query(
      "INSERT INTO store_products (name, description, price) VALUES ($1,$2,$3)",
      [name, description, price]
    );
  }
  console.log(`🛒 ${storeProducts.length} produits Forge insérés`);

  // ── ShowPass — ticket_clients + ticket_commandes ──
  await pool.query("DELETE FROM ticket_commandes");
  await pool.query("DELETE FROM ticket_clients");

  const c1 = await pool.query(
    "INSERT INTO ticket_clients (nom, prenom, telephone, date_naissance, adresse) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    ["Benlamara", "Ko", "613-555-0101", "1998-05-15", "123 Rue Principale, Ottawa"]
  );
  await pool.query(
    "INSERT INTO ticket_commandes (client_id, type_billet, nombre_billets, date_commande) VALUES ($1,$2,$3,$4)",
    [c1.rows[0].id, "VIP", 2, new Date().toISOString()]
  );

  const c2 = await pool.query(
    "INSERT INTO ticket_clients (nom, prenom, telephone, date_naissance, adresse) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    ["Tremblay", "Marie", "514-555-0202", "1995-11-20", "456 Av. des Pins, Montréal"]
  );
  await pool.query(
    "INSERT INTO ticket_commandes (client_id, type_billet, nombre_billets, date_commande) VALUES ($1,$2,$3,$4)",
    [c2.rows[0].id, "Standard", 4, new Date().toISOString()]
  );
  console.log("🎫 2 clients + 2 commandes ShowPass insérés");

  // ── Fin ──
  await pool.end();
  await mongoose.connection.close();
  console.log("\n🎉 Seed terminé avec succès !");
}

seed().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
