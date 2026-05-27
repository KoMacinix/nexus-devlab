const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const floranetAuth = require("../middleware/floranetAuth");

const router = express.Router();

const JWT_EXPIRE_MINUTES = parseInt(process.env.FLORANET_JWT_EXPIRE_MINUTES || "1440", 10); // 24h par défaut

/**
 * Comparaison à temps constant pour éviter les timing attacks.
 * Imite hmac.compare_digest() du Floranet original (Python).
 */
function safeEqual(a, b) {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * POST /api/floranet/auth/login
 *
 * Échange { username, password } contre un JWT Bearer.
 * Les identifiants sont définis via FLORANET_ADMIN_USERNAME / FLORANET_ADMIN_PASSWORD
 * dans .env (cohérent avec ADMIN_USERNAME / ADMIN_PASSWORD du Floranet original,
 * juste préfixés pour ne pas être confondus avec d'éventuels admins Nexus).
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ detail: "Identifiants requis" });
  }

  const expectedUser = process.env.FLORANET_ADMIN_USERNAME;
  const expectedPass = process.env.FLORANET_ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    // Aligné sur le Floranet original : si l'admin n'est pas configuré
    // côté serveur, le login est désactivé (pas de bypass).
    return res.status(503).json({
      detail: "Connexion Floranet désactivée : identifiants non configurés côté serveur",
    });
  }

  const userOk = safeEqual(String(username), expectedUser);
  const passOk = safeEqual(String(password), expectedPass);

  if (!userOk || !passOk) {
    return res.status(401).json({ detail: "Identifiants invalides" });
  }

  const token = jwt.sign(
    { sub: username, aud: "floranet" },
    process.env.JWT_SECRET,
    { expiresIn: `${JWT_EXPIRE_MINUTES}m` },
  );

  res.json({
    access_token: token,
    token_type: "bearer",
    expires_in: JWT_EXPIRE_MINUTES * 60,
  });
});

/**
 * GET /api/floranet/auth/me
 *
 * Retourne l'identité du porteur du JWT — utilisé par le front pour
 * vérifier qu'un token persisté en localStorage est encore valide.
 */
router.get("/me", floranetAuth, (req, res) => {
  res.json({ username: req.user.sub });
});

module.exports = router;
