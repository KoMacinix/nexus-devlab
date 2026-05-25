# 🧬 NEXUS DevLab

> Cinq projets full-stack. Un écosystème unifié.

NEXUS DevLab regroupe les technologies apprises à travers 5 projets réalisés durant le programme de 3 ans en informatique au programme informatique :

| Module | Projet d'origine | Technologies clés |
|--------|-------------------|-------------------|
| 🌍 **GeoIntel** | Pays | SOAP/XML, Spring Boot, NextAuth, JWT, bcrypt |
| 📦 **StockOS** | Inventaire | REST API, CRUD, Django REST Framework, SQLite |
| ⚡ **Arena** | Tookah | Socket.IO, WebSockets, MongoDB, temps réel |
| 🔐 **Forge** | htdocs | Laravel 12, PHP, AES-256, Sessions, MySQL, Eloquent |
| 🎫 **ShowPass** | TicketConcert | ASP.NET Core 8, C#, Entity Framework, SQL Server, Razor |

---

## Architecture

```
nexus-devlab/
├── frontend/            React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/  Navbar, ProjectCard, TechGalaxy
│   │   ├── pages/       Home, GeoIntel, StockOS, Arena, Forge, ShowPass
│   │   ├── api.js       Client Axios
│   │   └── socket.js    Client Socket.IO
│   └── README.md
│
├── backend/             Express.js + Socket.IO
│   ├── config/          Connexion BD (MongoDB + SQLite)
│   ├── middleware/       Auth JWT
│   ├── models/          Mongoose (User, Question, Player, Game)
│   ├── routes/          auth, countries, products, store, tickets
│   ├── socket/          Logique quiz temps réel
│   ├── seed.js          Données initiales (5 modules)
│   └── README.md
│
└── README.md            Ce fichier
```

## Prérequis

- **Node.js** >= 18
- **MongoDB** >= 6.0 (local ou Atlas)
- **npm** >= 9

## Démarrage rapide

```bash
# 1. Cloner
git clone <repo-url> nexus-devlab
cd nexus-devlab

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run seed

# 3. Frontend
cd ../frontend
npm install

# 4. Lancer (2 terminaux)
cd backend && npm run dev     # → http://localhost:4000
cd frontend && npm run dev    # → http://localhost:5173
```

---

## Modules détaillés

### 🌍 GeoIntel (Pays)
JWT login → requête SOAP simulée → parsing XML → données pays.
**Stack originale** : Next.js 16, Spring Boot, SOAP, NextAuth, bcrypt, xml2js.

### 📦 StockOS (Inventaire)
CRUD REST complet sur SQLite. Liste d'achat auto (qté < seuil).
**Stack originale** : React, Django REST Framework, Axios, SQLite.

### ⚡ Arena (Tookah)
Quiz multijoueur temps réel via Socket.IO. Lobby, timer, leaderboard, historique MongoDB.
**Stack originale** : React, Socket.IO, Express, MongoDB, Mongoose.

### 🔐 Forge (htdocs)
Auth chiffrée AES (CryptoJS client → PHP decrypt serveur), bcrypt, verrouillage de compte après 3 tentatives, sessions avec timeout. CRUD produits Laravel-style.
**Stack originale** : PHP 8.2, Laravel 12, Eloquent, Blade, MySQL/PDO, Bootstrap, XAMPP.

### 🎫 ShowPass (TicketConcert)
Billetterie concert : formulaire avec validation Data Annotations, ViewModel composite, relation Client→Commande avec EF Core, page de confirmation.
**Stack originale** : C#, ASP.NET Core 8, Entity Framework Core, SQL Server, Razor Views, Migrations.

---

## Auteur

**Ko** — Programme informatique, Programme informatique (3 ans)
