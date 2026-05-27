const jwt = require("jsonwebtoken");

/**
 * Middleware JWT spécifique à Floranet.
 *
 * Pourquoi un middleware dédié ?
 *   Le JWT de Floranet ne porte qu'un `sub` (username admin) — ce n'est pas
 *   le même format que les JWT Nexus (qui portent `id` + `email` MongoDB).
 *   Ce middleware lit donc `sub` au lieu de `id`, et stocke req.user = { sub }.
 *
 * Convention :
 *   - Header   : Authorization: Bearer <token>
 *   - Secret   : process.env.JWT_SECRET (partagé avec Nexus — c'est correct,
 *                un secret HMAC peut signer plusieurs schémas tant que les
 *                payloads sont disjoints, ce qui est notre cas : un JWT
 *                Nexus a `id` mais pas `sub`, un JWT Floranet a `sub` mais
 *                pas `id`).
 *   - Audience : on inclut `aud: "floranet"` à l'émission pour pouvoir un
 *                jour discriminer si besoin, sans rendre la vérif stricte
 *                aujourd'hui (rétro-compatibilité).
 */
function floranetAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Token manquant" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Le JWT Floranet doit contenir un sub (username).
    // S'il n'a que `id` (c'est un JWT Nexus standard), on refuse — la
    // séparation des deux systèmes d'auth est volontaire.
    if (!decoded.sub) {
      return res.status(401).json({ detail: "Token invalide pour Floranet" });
    }

    req.user = { sub: decoded.sub };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ detail: "Token expiré" });
    }
    return res.status(401).json({ detail: "Token invalide ou expiré" });
  }
}

module.exports = floranetAuthMiddleware;
