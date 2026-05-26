# Backend — NEXUS DevLab

Serveur Express.js unifié qui expose 5 modules.

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| Runtime | Node.js 18+, Express.js 4 |
| Auth | JSON Web Tokens, bcryptjs, AES-256-CBC (crypto) |
| Base de données | MongoDB (Mongoose) — quiz/joueurs, PostgreSQL/Neon (pg) — inventaire/store/tickets |
| Temps réel | Socket.IO 4 |
| Protocole | SOAP/XML simulé (xml2js) |
| Outils | dotenv, cors, nodemon |

## Structure

```
backend/
├── server.js           Point d'entrée principal
├── seed.js             Données initiales (5 modules)
├── .env.example        Variables d'environnement
├── config/
│   ├── mongo.js        Connexion MongoDB
│   └── postgres.js     PostgreSQL/Neon (4 tables: products, store_products, ticket_clients, ticket_commandes)
├── middleware/
│   └── auth.js         Middleware JWT
├── models/
│   ├── Question.js     Mongoose — questions quiz
│   ├── Player.js       Mongoose — joueurs
│   ├── Game.js         Mongoose — historique parties
│   └── User.js         Mongoose — utilisateurs auth
├── routes/
│   ├── auth.js         POST /api/auth/register, /login, GET /me
│   ├── countries.js    POST /api/countries/soap (GeoIntel)
│   ├── products.js     CRUD /api/products (StockOS)
│   ├── store.js        POST /api/store/login-encrypted + CRUD /api/store/products (Forge)
│   └── tickets.js      POST /api/tickets/commande + GET /commandes (ShowPass)
└── socket/
    └── quiz.js         Logique Socket.IO (Arena)
```

## Tous les endpoints

### Auth (`/api/auth`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/register` | Créer un compte | Non |
| POST | `/login` | Connexion → JWT | Non |
| GET | `/me` | Utilisateur courant | Oui |

### GeoIntel (`/api/countries`)
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/soap` | Requête SOAP simulée → info pays | Oui |
| GET | `/list` | Liste des pays | Non |

### StockOS (`/api/products`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Tous les produits |
| GET | `/shopping` | Produits sous le seuil |
| POST | `/` | Ajouter un produit |
| PUT | `/:id` | Modifier |
| DELETE | `/:id` | Supprimer |

### Forge (`/api/store`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/login-encrypted` | Auth AES chiffrée (simule PHP) |
| GET | `/encrypt-test` | Test du chiffrement |
| GET | `/products` | Liste produits (Eloquent) |
| POST | `/products` | Ajouter (validation Laravel) |
| PUT | `/products/:id` | Modifier |
| DELETE | `/products/:id` | Supprimer |

### ShowPass (`/api/tickets`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/types` | Types de billets |
| POST | `/commande` | Créer commande + client |
| GET | `/commandes` | Historique (EF Include) |
| GET | `/commande/:id` | Détail commande |

### Socket.IO (Arena)
| Événement | Direction | Description |
|-----------|-----------|-------------|
| `joinGame` | Client → Serveur | Rejoindre le lobby |
| `joined` | Serveur → Client | Confirmation |
| `newQuestion` | Serveur → Client | Nouvelle question |
| `answer` | Client → Serveur | Réponse |
| `questionResults` | Serveur → Client | Résultats + leaderboard |
| `finalResults` | Serveur → Client | Fin de partie |

## Installation

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # Insère: 1 user, 10 questions, 8 produits inv, 5 produits store, 2 clients/commandes
npm run dev
```

## Variables d'environnement

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/nexus-devlab
JWT_SECRET=votre-secret-jwt-ici
```
