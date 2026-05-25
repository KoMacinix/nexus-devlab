const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getDB } = require("../config/sqlite");

const router = express.Router();

// ── Simulation du déchiffrement AES CryptoJS (comme decrypt.php) ──
function decryptCryptoJsAes(passphrase, jsonStr) {
  try {
    const json = JSON.parse(jsonStr);
    const salt = Buffer.from(json.s, "hex");
    const ct = Buffer.from(json.ct, "base64");
    const iv = Buffer.from(json.iv, "hex");

    // Dérivation de clé identique à CryptoJS (MD5-based)
    const concat = Buffer.concat([Buffer.from(passphrase, "utf8"), salt]);
    const md5_0 = crypto.createHash("md5").update(concat).digest();
    const md5_1 = crypto.createHash("md5").update(Buffer.concat([md5_0, concat])).digest();
    const md5_2 = crypto.createHash("md5").update(Buffer.concat([md5_1, concat])).digest();
    const key = Buffer.concat([md5_0, md5_1]).subarray(0, 32);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(ct, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

// ── Simulation chiffrement AES CryptoJS (pour le frontend) ──
function encryptCryptoJsAes(passphrase, data) {
  const salt = crypto.randomBytes(8);
  const concat = Buffer.concat([Buffer.from(passphrase, "utf8"), salt]);
  const md5_0 = crypto.createHash("md5").update(concat).digest();
  const md5_1 = crypto.createHash("md5").update(Buffer.concat([md5_0, concat])).digest();
  const key = Buffer.concat([md5_0, md5_1]).subarray(0, 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return JSON.stringify({
    ct: encrypted.toString("base64"),
    iv: iv.toString("hex"),
    s: salt.toString("hex"),
  });
}

// ── Gestion des tentatives de connexion (simule ClientDao) ──
const loginAttempts = new Map(); // email -> { count, blockedUntil }
const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 1;

function getAttempts(email) {
  return loginAttempts.get(email) || { count: 0, blockedUntil: null };
}

// ── POST /api/store/login-encrypted ── (simule authentificationBD.php)
router.post("/login-encrypted", async (req, res) => {
  try {
    const { user: email, pass: encryptedPass } = req.body;

    if (!email || !encryptedPass) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Vérifier si le compte est bloqué
    const attempts = getAttempts(email);
    if (attempts.blockedUntil && new Date() < new Date(attempts.blockedUntil)) {
      return res.status(403).json({
        error: `Compte bloqué jusqu'à ${attempts.blockedUntil}`,
        locked: true,
        lockedUntil: attempts.blockedUntil,
      });
    }

    // Déchiffrer le mot de passe AES (comme decrypt.php)
    const decrypted = decryptCryptoJsAes("CeciEstUneCleSecrete", encryptedPass);
    if (!decrypted) {
      return res.status(400).json({ error: "Erreur de déchiffrement AES" });
    }

    // Chercher l'utilisateur
    const userDoc = await User.findOne({ email: email.toLowerCase() });
    if (!userDoc) {
      return res.status(401).json({ error: "Utilisateur inexistant" });
    }

    // Vérifier le mot de passe (bcrypt comme Laravel)
    const valid = await bcrypt.compare(decrypted, userDoc.password);
    if (!valid) {
      // Incrémenter les tentatives
      const newCount = attempts.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const blockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
        loginAttempts.set(email, { count: 0, blockedUntil });
        return res.status(403).json({
          error: `Trop de tentatives (${MAX_ATTEMPTS}). Compte bloqué pendant ${LOCK_MINUTES} minute(s).`,
          locked: true,
          lockedUntil: blockedUntil,
        });
      }
      loginAttempts.set(email, { count: newCount, blockedUntil: null });
      return res.status(401).json({
        error: "Identifiants invalides",
        attemptsLeft: MAX_ATTEMPTS - newCount,
      });
    }

    // Reset tentatives
    loginAttempts.delete(email);

    // Générer le token JWT (simule la session PHP)
    const token = jwt.sign(
      { id: userDoc._id, email: userDoc.email, name: userDoc.name },
      process.env.JWT_SECRET,
      { expiresIn: "2m" } // Timeout de 2 minutes comme session.php
    );

    res.json({
      token,
      user: { id: userDoc._id, name: userDoc.name, email: userDoc.email },
      message: "Connexion réussie",
    });
  } catch (err) {
    console.error("Forge login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── GET /api/store/encrypt-test ── (pour tester le chiffrement)
router.get("/encrypt-test", (_req, res) => {
  const sample = encryptCryptoJsAes("CeciEstUneCleSecrete", "123456");
  res.json({ encrypted: sample, note: "Vous pouvez envoyer ceci dans POST /login-encrypted" });
});

// ── CRUD Produits Laravel-style (simule Eloquent Products) ──

// GET /api/store/products
router.get("/products", (_req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare("SELECT * FROM store_products ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture produits" });
  }
});

// POST /api/store/products (simule store() avec validation Laravel)
router.post("/products", (req, res) => {
  try {
    const { name, description, price } = req.body;
    const errors = {};
    if (!name) errors.name = "Le nom du produit est requis.";
    if (!description) errors.description = "La description est requise.";
    if (price == null || isNaN(price)) errors.price = "Le prix doit être un nombre.";

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    const db = getDB();
    const info = db
      .prepare("INSERT INTO store_products (name, description, price) VALUES (?, ?, ?)")
      .run(name, description, Number(price));
    const product = db.prepare("SELECT * FROM store_products WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Erreur création produit" });
  }
});

// PUT /api/store/products/:id (simule update())
router.put("/products/:id", (req, res) => {
  try {
    const { name, description, price } = req.body;
    const errors = {};
    if (!name) errors.name = "Le nom du produit est requis.";
    if (!description) errors.description = "La description est requise.";
    if (price == null || isNaN(price)) errors.price = "Le prix doit être un nombre.";

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    const db = getDB();
    const existing = db.prepare("SELECT * FROM store_products WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Produit introuvable" });

    db.prepare("UPDATE store_products SET name = ?, description = ?, price = ? WHERE id = ?")
      .run(name, description, Number(price), req.params.id);
    const updated = db.prepare("SELECT * FROM store_products WHERE id = ?").get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erreur modification produit" });
  }
});

// DELETE /api/store/products/:id
router.delete("/products/:id", (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare("SELECT * FROM store_products WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Produit introuvable" });
    db.prepare("DELETE FROM store_products WHERE id = ?").run(req.params.id);
    res.json({ message: "Produit supprimé", id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

module.exports = router;
