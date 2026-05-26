/**
 * routes/store.js — module Tutti Frutti.
 *
 * Reproduit fidèlement le comportement du couple PHP/Laravel d'origine :
 *
 *   1) TestAutenAuto (PHP brut) :
 *      - Chiffrement AES côté client (CryptoJS, clé "CeciEstUneCleSecrete")
 *      - Déchiffrement côté serveur (KDF MD5 compatible CryptoJS)
 *      - Vérification bcrypt
 *      - Comptage de tentatives + blocage 1 minute après 3 échecs
 *
 *   2) Laravel app-name :
 *      - Register avec validation : name requis, email unique, password
 *        confirmé + 8 chars / maj / min / chiffre / symbole
 *      - CRUD products protégé (middleware ExternalAuth) → ici authMiddleware JWT
 *      - Validation create/update : name + description + price numérique
 *
 * Tables :
 *   - users (MongoDB)          → comptes
 *   - store_products (Postgres) → produits
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getPool } = require("../config/postgres");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// AES (compat CryptoJS) — clé identique au projet original
// ─────────────────────────────────────────────────────────────────────────────
const AES_PASSPHRASE = process.env.AES_SECRET_KEY || "CeciEstUneCleSecrete";

/**
 * Déchiffre un payload AES produit par CryptoJS.AES.encrypt(...)
 * avec le KDF historique (MD5 itéré, salt 8 bytes).
 */
function decryptCryptoJsAes(passphrase, jsonStr) {
  try {
    const json = JSON.parse(jsonStr);
    const salt = Buffer.from(json.s, "hex");
    const ct = Buffer.from(json.ct, "base64");
    const iv = Buffer.from(json.iv, "hex");
    const concat = Buffer.concat([Buffer.from(passphrase, "utf8"), salt]);
    const md5_0 = crypto.createHash("md5").update(concat).digest();
    const md5_1 = crypto
      .createHash("md5")
      .update(Buffer.concat([md5_0, concat]))
      .digest();
    const key = Buffer.concat([md5_0, md5_1]).subarray(0, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(ct, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

function encryptCryptoJsAes(passphrase, data) {
  const salt = crypto.randomBytes(8);
  const concat = Buffer.concat([Buffer.from(passphrase, "utf8"), salt]);
  const md5_0 = crypto.createHash("md5").update(concat).digest();
  const md5_1 = crypto
    .createHash("md5")
    .update(Buffer.concat([md5_0, concat]))
    .digest();
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

// ─────────────────────────────────────────────────────────────────────────────
// Tentatives de login (en mémoire) — équivalent des colonnes
// `tentatives` / `bloque_jusqua` de la table users dans le projet original.
//
// NB : sur Render free tier le service dort après 15 min ; l'état est donc
// remis à zéro après un sleep. Acceptable pour une démo.
// ─────────────────────────────────────────────────────────────────────────────
const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 1;

function getAttempts(email) {
  return loginAttempts.get(email) || { count: 0, blockedUntil: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation register — règles AuthController.php (Laravel)
// ─────────────────────────────────────────────────────────────────────────────
function validateRegister({ name, email, password, password_confirmation }) {
  const errors = {};

  // name : required|string|max:255
  if (!name || typeof name !== "string" || !name.trim()) {
    errors.name = "Le nom est obligatoire.";
  } else if (name.length > 255) {
    errors.name = "Le nom est trop long (max 255 caractères).";
  }

  // email : required|string|email|max:255|unique:users  (unique testé plus loin)
  if (!email || typeof email !== "string" || !email.trim()) {
    errors.email = "L'adresse email est obligatoire.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email =
      "L'adresse e-mail n'est pas valide. Elle doit être au format suivant : exemple@exemple.com";
  } else if (email.length > 255) {
    errors.email = "L'adresse email est trop longue (max 255 caractères).";
  }

  // password : required|confirmed + règles custom
  if (!password) {
    errors.password = "Le mot de passe est requis.";
  } else {
    if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      errors.password =
        "Le mot de passe doit contenir au moins une lettre majuscule et une minuscule.";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Le mot de passe doit contenir au moins un chiffre.";
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.password = "Le mot de passe doit contenir au moins un symbole.";
    }
  }

  // password.confirmed
  if (password && password_confirmation !== password) {
    errors.password_confirmation =
      "La confirmation du mot de passe ne correspond pas.";
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/store/register — équivalent AuthController@register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, password_confirmation } = req.body || {};

    // 1. Validation Laravel-style (renvoie 422 + { errors: { champ: msg } })
    const errors = validateRegister({ name, email, password, password_confirmation });

    // 2. Unicité email (équivalent `email|unique:users` Laravel)
    if (!errors.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        errors.email = "Cette adresse email est déjà utilisée.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    // 3. Création (bcrypt 10 rounds, identique à Laravel Hash::make)
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
    });

    res.status(201).json({
      message: "Compte créé avec succès.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Forge register error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/store/login-encrypted — équivalent TestAutenAuto/authentificationBD.php
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login-encrypted", async (req, res) => {
  try {
    const { user: email, pass: encryptedPass } = req.body;
    if (!email || !encryptedPass) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const attempts = getAttempts(email);
    if (attempts.blockedUntil && new Date() < new Date(attempts.blockedUntil)) {
      return res.status(403).json({
        error: `Compte bloqué jusqu'à ${attempts.blockedUntil}`,
        locked: true,
        lockedUntil: attempts.blockedUntil,
      });
    }

    const decrypted = decryptCryptoJsAes(AES_PASSPHRASE, encryptedPass);
    if (decrypted == null) {
      return res.status(400).json({ error: "Erreur de déchiffrement AES" });
    }

    const userDoc = await User.findOne({ email: email.toLowerCase() });
    if (!userDoc) {
      return res.status(401).json({ error: "Utilisateur inexistant" });
    }

    const valid = await bcrypt.compare(decrypted, userDoc.password);
    if (!valid) {
      const newCount = attempts.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const blockedUntil = new Date(
          Date.now() + LOCK_MINUTES * 60 * 1000
        ).toISOString();
        loginAttempts.set(email, { count: 0, blockedUntil });
        return res.status(403).json({
          error: `Trop de tentatives. Compte bloqué ${LOCK_MINUTES} minute(s).`,
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

    loginAttempts.delete(email);
    const token = jwt.sign(
      { id: userDoc._id, email: userDoc.email, name: userDoc.name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/store/encrypt-test — petit utilitaire (peut rester ouvert)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/encrypt-test", (_req, res) => {
  const sample = encryptCryptoJsAes(AES_PASSPHRASE, "123456");
  res.json({ encrypted: sample });
});

// ─────────────────────────────────────────────────────────────────────────────
// CRUD produits — table store_products (Postgres / Neon)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/store/products — lecture PUBLIQUE (catalogue accessible à tous,
// comme l'original Laravel : Route::get('/product', ...) hors middleware)
router.get("/products", async (_req, res) => {
  try {
    const { rows } = await getPool().query(
      "SELECT * FROM store_products ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Forge products list error:", err);
    res.status(500).json({ error: "Erreur lecture produits" });
  }
});

// Validation produit — équivalent Laravel ProductController@store / update
function validateProduct({ name, description, price }) {
  const errors = {};
  if (!name) errors.name = "Le nom du produit est requis.";
  if (!description) errors.description = "La description est requise.";
  if (price === undefined || price === null || price === "" || isNaN(Number(price))) {
    errors.price = "Le prix doit être un nombre.";
  }
  return errors;
}

// POST /api/store/products — PROTÉGÉ (équivalent ExternalAuth middleware)
router.post("/products", authMiddleware, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const errors = validateProduct({ name, description, price });
    if (Object.keys(errors).length > 0) return res.status(422).json({ errors });

    const { rows } = await getPool().query(
      "INSERT INTO store_products (name, description, price) VALUES ($1,$2,$3) RETURNING *",
      [name, description, Number(price)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Forge product create error:", err);
    res.status(500).json({ error: "Erreur création produit" });
  }
});

// PUT /api/store/products/:id — PROTÉGÉ
router.put("/products/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const errors = validateProduct({ name, description, price });
    if (Object.keys(errors).length > 0) return res.status(422).json({ errors });

    const existing = await getPool().query(
      "SELECT * FROM store_products WHERE id = $1",
      [req.params.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    const { rows } = await getPool().query(
      "UPDATE store_products SET name=$1, description=$2, price=$3 WHERE id=$4 RETURNING *",
      [name, description, Number(price), req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Forge product update error:", err);
    res.status(500).json({ error: "Erreur modification produit" });
  }
});

// DELETE /api/store/products/:id — PROTÉGÉ
router.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const existing = await getPool().query(
      "SELECT * FROM store_products WHERE id = $1",
      [req.params.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }
    await getPool().query("DELETE FROM store_products WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ message: "Produit supprimé", id: Number(req.params.id) });
  } catch (err) {
    console.error("Forge product delete error:", err);
    res.status(500).json({ error: "Erreur suppression" });
  }
});

module.exports = router;
