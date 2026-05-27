require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

/**
 * FRONTEND_URL peut contenir une seule URL ou plusieurs séparées par des
 * virgules — pratique en prod pour autoriser à la fois :
 *   - le domaine OVH (ex: https://tookah.mondomaine.com)
 *   - l'URL Render du frontend (ex: https://nexus-devlab.onrender.com)
 *   - des previews Render
 */
function parseOrigins(raw) {
  const fallback = ["http://localhost:5173", "http://localhost:3000"];
  if (!raw) return fallback;
  const list = raw
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [...new Set([...list, ...fallback])];
}

const ALLOWED_ORIGINS = parseOrigins(process.env.FRONTEND_URL);

const corsOptions = {
  origin: (origin, cb) => {
    // origin === undefined → outils CLI (curl, Postman) ou same-origin → on accepte
    if (!origin) return cb(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (ALLOWED_ORIGINS.includes(cleanOrigin)) return cb(null, true);
    return cb(new Error(`Origin non autorisée par CORS : ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// App + serveur HTTP
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// Important sur Render : on est derrière un reverse-proxy.
// Sans ça, req.ip / wss handshake peuvent être faussés.
app.set("trust proxy", 1);

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO
// ─────────────────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Sur Render free tier, le service dort après 15 min → quand il se réveille,
  // un client encore ouvert peut avoir besoin de plus de temps que par défaut.
  pingTimeout: 30000,
  pingInterval: 25000,
});

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Connexions BD
// ─────────────────────────────────────────────────────────────────────────────
const connectMongo = require("./config/mongo");
const { connectPostgres } = require("./config/postgres");

// Modèles Tookah pour le reset au boot
const Player = require("./models/Player");
const Game = require("./models/Game");

// ─────────────────────────────────────────────────────────────────────────────
// Routes API
// ─────────────────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const countryRoutes = require("./routes/countries");
const productRoutes = require("./routes/products");
const storeRoutes = require("./routes/store");
const ticketRoutes = require("./routes/tickets");
const floranetRoutes = require("./routes/floranet");
const floranetAuthRoutes = require("./routes/floranetAuth");

app.use("/api/auth", authRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/floranet/auth", floranetAuthRoutes);
app.use("/api/floranet", floranetRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Health check (utilisé aussi pour réveiller Render si free tier)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    name: "NEXUS DevLab API",
    modules: [
      "GeoIntel (SOAP)",
      "StockOS (CRUD)",
      "Tookah (Socket.IO)",
      "Tutti Frutti (Laravel/AES Auth)",
      "TicketConcert (ASP.NET MVC)",
      "FloraNet (IoT/LSTM)",
    ],
  });
});

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO — Tookah
// ─────────────────────────────────────────────────────────────────────────────
const initQuizSocket = require("./socket/quiz");

// ─────────────────────────────────────────────────────────────────────────────
// Démarrage
// ─────────────────────────────────────────────────────────────────────────────
async function start() {
  // 1. MongoDB (Atlas) — Tookah + Auth
  await connectMongo();

  // Nettoyage Tookah au boot (comportement de l'app Tookah originale :
  // un boot serveur = lobby vierge, pas d'orphelins de la session précédente).
  try {
    await Player.deleteMany({});
    await Game.deleteMany({});
    console.log("🧹 Tookah : collections 'players' et 'games' vidées");
  } catch (err) {
    console.warn("⚠️  Reset Tookah ignoré :", err.message);
  }

  // 2. PostgreSQL/Neon — StockOS, Forge, ShowPass
  await connectPostgres();

  // 3. Socket.IO — Tookah
  initQuizSocket(io);

  // 4. Serveur HTTP
  //    Sur Render, le port est imposé par la variable PORT.
  server.listen(PORT, () => {
    console.log(`\n🚀 NEXUS DevLab API sur http://localhost:${PORT}`);
    console.log(`   CORS autorisé : ${ALLOWED_ORIGINS.join(", ")}`);
    console.log(`   ├─ 🌍 GeoIntel      : POST /api/countries/soap`);
    console.log(`   ├─ 📦 StockOS       : /api/products`);
    console.log(`   ├─ 📖 Tookah        : Socket.IO (ws://localhost:${PORT})`);
    console.log(`   ├─ 🍊 Tutti Frutti  : /api/store`);
    console.log(`   ├─ 🎫 TicketConcert : /api/tickets`);
    console.log(`   ├─ 🌿 FloraNet      : /api/floranet`);
    console.log(`   └─ 🔑 Auth          : /api/auth\n`);
  });
}

// Arrêt propre sur SIGTERM (Render envoie ce signal lors d'un redeploy)
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM reçu — fermeture propre");
  server.close(() => process.exit(0));
});

start().catch((err) => {
  console.error("Erreur démarrage :", err);
  process.exit(1);
});
