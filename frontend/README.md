# Frontend — NEXUS DevLab

Interface React unifiée pour les 5 modules du projet.

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| Framework | React 18, Vite |
| Style | Tailwind CSS 3 |
| HTTP | Axios |
| Temps réel | Socket.IO Client |
| Routing | React Router v6 |

## Structure

```
frontend/
├── index.html
├── vite.config.js          Proxy API + WebSocket
├── tailwind.config.js
├── package.json
└── src/
    ├── main.jsx             Entry point
    ├── App.jsx              Router (6 routes)
    ├── index.css            Tailwind + custom
    ├── api.js               Axios + intercepteur JWT
    ├── socket.js            Socket.IO client
    ├── components/
    │   ├── Navbar.jsx       Navigation 5 modules
    │   ├── ProjectCard.jsx  Carte projet réutilisable
    │   └── TechGalaxy.jsx   Grille de toutes les technologies
    └── pages/
        ├── Home.jsx         Landing page + aperçu
        ├── GeoIntel.jsx     Login JWT + SOAP
        ├── StockOS.jsx      CRUD inventaire
        ├── Arena.jsx        Quiz Socket.IO
        ├── Forge.jsx        Auth AES + CRUD Laravel
        └── ShowPass.jsx     Billetterie ASP.NET MVC
```

## Pages

| Route | Page | Projet d'origine |
|-------|------|------------------|
| `/` | Home | Landing + tech map |
| `/geointel` | GeoIntel | Pays |
| `/stockos` | StockOS | Inventaire |
| `/arena` | Arena | Tookah |
| `/forge` | Forge | htdocs |
| `/showpass` | ShowPass | TicketConcert |

## Installation

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build   # Génère dist/
```
