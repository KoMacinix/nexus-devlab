const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getPool } = require("../config/postgres");

const router = express.Router();

function decryptCryptoJsAes(passphrase, jsonStr) {
  try {
    const json = JSON.parse(jsonStr);
    const salt = Buffer.from(json.s, "hex");
    const ct = Buffer.from(json.ct, "base64");
    const iv = Buffer.from(json.iv, "hex");
    const concat = Buffer.concat([Buffer.from(passphrase, "utf8"), salt]);
    const md5_0 = crypto.createHash("md5").update(concat).digest();
    const md5_1 = crypto.createHash("md5").update(Buffer.concat([md5_0, concat])).digest();
    const key = Buffer.concat([md5_0, md5_1]).subarray(0, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(ct, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch { return null; }
}

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
  return JSON.stringify({ ct: encrypted.toString("base64"), iv: iv.toString("hex"), s: salt.toString("hex") });
}

const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 1;
function getAttempts(email) { return loginAttempts.get(email) || { count: 0, blockedUntil: null }; }

// ── POST /api/store/login-encrypted ──
router.post("/login-encrypted", async (req, res) => {
  try {
    const { user: email, pass: encryptedPass } = req.body;
    if (!email || !encryptedPass) return res.status(400).json({ error: "Email et mot de passe requis" });

    const attempts = getAttempts(email);
    if (attempts.blockedUntil && new Date() < new Date(attempts.blockedUntil)) {
      return res.status(403).json({ error: `Compte bloqué jusqu'à ${attempts.blockedUntil}`, locked: true, lockedUntil: attempts.blockedUntil });
    }

    const decrypted = decryptCryptoJsAes("CeciEstUneCleSecrete", encryptedPass);
    if (!decrypted) return res.status(400).json({ error: "Erreur de déchiffrement AES" });

    const userDoc = await User.findOne({ email: email.toLowerCase() });
    if (!userDoc) return res.status(401).json({ error: "Utilisateur inexistant" });

    const valid = await bcrypt.compare(decrypted, userDoc.password);
    if (!valid) {
      const newCount = attempts.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const blockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
        loginAttempts.set(email, { count: 0, blockedUntil });
        return res.status(403).json({ error: `Trop de tentatives. Compte bloqué ${LOCK_MINUTES} minute(s).`, locked: true, lockedUntil: blockedUntil });
      }
      loginAttempts.set(email, { count: newCount, blockedUntil: null });
      return res.status(401).json({ error: "Identifiants invalides", attemptsLeft: MAX_ATTEMPTS - newCount });
    }

    loginAttempts.delete(email);
    const token = jwt.sign({ id: userDoc._id, email: userDoc.email, name: userDoc.name }, process.env.JWT_SECRET, { expiresIn: "2m" });
    res.json({ token, user: { id: userDoc._id, name: userDoc.name, email: userDoc.email }, message: "Connexion réussie" });
  } catch (err) {
    console.error("Forge login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/encrypt-test", (_req, res) => {
  const sample = encryptCryptoJsAes("CeciEstUneCleSecrete", "123456");
  res.json({ encrypted: sample });
});

// ── GET /api/store/products ──
router.get("/products", async (_req, res) => {
  try {
    const { rows } = await getPool().query("SELECT * FROM store_products ORDER BY id DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Erreur lecture produits" }); }
});

// ── POST /api/store/products ──
router.post("/products", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const errors = {};
    if (!name) errors.name = "Le nom du produit est requis.";
    if (!description) errors.description = "La description est requise.";
    if (price == null || isNaN(price)) errors.price = "Le prix doit être un nombre.";
    if (Object.keys(errors).length > 0) return res.status(422).json({ errors });

    const { rows } = await getPool().query(
      "INSERT INTO store_products (name, description, price) VALUES ($1,$2,$3) RETURNING *",
      [name, description, Number(price)]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: "Erreur création produit" }); }
});

// ── PUT /api/store/products/:id ──
router.put("/products/:id", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const errors = {};
    if (!name) errors.name = "Le nom du produit est requis.";
    if (!description) errors.description = "La description est requise.";
    if (price == null || isNaN(price)) errors.price = "Le prix doit être un nombre.";
    if (Object.keys(errors).length > 0) return res.status(422).json({ errors });

    const existing = await getPool().query("SELECT * FROM store_products WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Produit introuvable" });

    const { rows } = await getPool().query(
      "UPDATE store_products SET name=$1, description=$2, price=$3 WHERE id=$4 RETURNING *",
      [name, description, Number(price), req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: "Erreur modification produit" }); }
});

// ── DELETE /api/store/products/:id ──
router.delete("/products/:id", async (req, res) => {
  try {
    const existing = await getPool().query("SELECT * FROM store_products WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Produit introuvable" });
    await getPool().query("DELETE FROM store_products WHERE id = $1", [req.params.id]);
    res.json({ message: "Produit supprimé", id: Number(req.params.id) });
  } catch (err) { res.status(500).json({ error: "Erreur suppression" }); }
});

module.exports = router;
