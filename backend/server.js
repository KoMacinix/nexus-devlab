require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// ── Config ──
const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);

// ── Socket.IO ──
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// ── Middleware ──
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
}));
app.use(express.json());

// ── Connexions BD ──
const connectMongo = require("./config/mongo");
const { connectSQLite } = require("./config/sqlite");

// ── Routes ──
const authRoutes = require("./routes/auth");
const countryRoutes = require("./routes/countries");
const productRoutes = require("./routes/products");
const storeRoutes = require("./routes/store");
const ticketRoutes = require("./routes/tickets");
const floranetRoutes = require("./routes/floranet");

app.use("/api/auth", authRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/floranet", floranetRoutes);

// ── Health check ──
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    name: "NEXUS DevLab API",
    modules: [
      "GeoIntel (SOAP)",
      "StockOS (CRUD)",
      "Arena (Socket.IO)",
      "Forge (Laravel/AES Auth)",
      "ShowPass (ASP.NET MVC)",
      "FloraNet (IoT/LSTM)",
    ],
  });
});

// ── Socket.IO — Quiz Arena ──
const initQuizSocket = require("./socket/quiz");

// ── Démarrage ──
async function start() {
  // 1. MongoDB (pour Arena + Auth)
  await connectMongo();

  // 2. SQLite (pour StockOS, Forge, ShowPass)
  connectSQLite();

  // 3. Socket.IO
  initQuizSocket(io);

  // 4. Serveur HTTP
  server.listen(PORT, () => {
    console.log(`\n🚀 NEXUS DevLab API sur http://localhost:${PORT}`);
    console.log(`   ├─ 🌍 GeoIntel  : POST /api/countries/soap`);
    console.log(`   ├─ 📦 StockOS   : /api/products`);
    console.log(`   ├─ ⚡ Arena     : Socket.IO (ws://localhost:${PORT})`);
    console.log(`   ├─ 🔐 Forge     : /api/store`);
    console.log(`   ├─ 🎫 ShowPass  : /api/tickets`);
    console.log(`   ├─ 🔥 FloraNet  : /api/floranet`);
    console.log(`   └─ 🔑 Auth      : /api/auth\n`);
  });
}

start().catch((err) => {
  console.error("Erreur démarrage :", err);
  process.exit(1);
});
