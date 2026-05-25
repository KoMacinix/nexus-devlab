import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const PROJECTS = [
  {
    icon: "🌍", name: "GeoIntel", origin: "Pays",
    tagline: "Service SOAP · Données géopolitiques",
    description: "Client consommant un web service SOAP pour interroger une base de pays. Authentification JWT et hachage bcrypt.",
    color: "#00e5a0", to: "/geointel",
    stack: ["Next.js", "Spring Boot", "SOAP/XML", "JWT", "bcrypt"],
  },
  {
    icon: "📦", name: "StockOS", origin: "Inventaire",
    tagline: "REST API · CRUD complet",
    description: "Gestion d'inventaire avec CRUD complet et liste d'achat automatique quand le stock passe sous le seuil.",
    color: "#7c5cfc", to: "/stockos",
    stack: ["React", "Django/DRF", "SQLite", "Axios", "REST API"],
  },
  {
    icon: "⚡", name: "Arena", origin: "Tookah",
    tagline: "WebSocket · Temps réel",
    description: "Quiz multijoueur en temps réel avec lobby dynamique, timer, leaderboard live et historique MongoDB.",
    color: "#ff6b6b", to: "/arena",
    stack: ["Socket.IO", "Express", "MongoDB", "Mongoose", "WebSockets"],
  },
  {
    icon: "🔐", name: "Forge", origin: "htdocs",
    tagline: "Laravel · PHP Auth · AES",
    description: "Auth chiffrée AES (CryptoJS → PHP decrypt), verrouillage de compte, sessions, CRUD produits Laravel avec Eloquent et Blade.",
    color: "#fbbf24", to: "/forge",
    stack: ["PHP 8.2", "Laravel 12", "AES-256", "Eloquent", "Blade", "MySQL"],
  },
  {
    icon: "🎫", name: "ShowPass", origin: "TicketConcert",
    tagline: "ASP.NET Core · MVC · EF Core",
    description: "Billetterie de concert ASP.NET Core MVC avec Entity Framework, Data Annotations, ViewModel et migrations SQL Server.",
    color: "#38bdf8", to: "/showpass",
    stack: ["C#", "ASP.NET Core 8", "EF Core", "SQL Server", "Razor"],
  },
  {
    icon: "🔥", name: "FloraNet", origin: "Floranet_v4",
    tagline: "IoT · LSTM · Leaflet · FastAPI",
    description: "Système de détection d'incendies forestiers avec capteurs LoRa/ESP32, modèle LSTM (334K params), carte interactive et dashboard temps réel.",
    color: "#ff6b00", to: "/floranet",
    stack: ["PyTorch", "FastAPI", "LoRa", "Leaflet", "TDMA", "PostgreSQL"],
  },
];

const STACK_HIGHLIGHTS = [
  "React", "Next.js", "Django", "Spring Boot", "Laravel",
  "ASP.NET", "FastAPI", "PyTorch", "Socket.IO", "Leaflet",
  "MongoDB", "PostgreSQL",
];

function useTypingEffect(words, speed = 100, pause = 2000) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.substring(0, charIdx + 1));
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(charIdx + 1);
        }
      } else {
        setText(word.substring(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setWordIdx((wordIdx + 1) % words.length);
        } else {
          setCharIdx(charIdx - 1);
        }
      }
    }, deleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
}

export default function Home() {
  const typedText = useTypingEffect(
    ["du SOAP au temps réel", "du PHP chiffré au MVC .NET", "de l'IoT au Deep Learning", "6 projets, 1 écosystème"],
    70, 2200
  );

  return (
    <>
      <style>{`
        .home-hero {
          padding: 60px 0 32px; text-align: center;
          animation: homeSlideIn 0.7s ease-out;
        }
        @keyframes homeSlideIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        .home-hero h1 {
          font-size: clamp(2.2rem, 6vw, 3.8rem); font-weight: 900;
          letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 16px;
          background: linear-gradient(135deg, #e0e0e8 0%, #7c5cfc 40%, #00e5a0 80%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .home-hero .subtitle {
          font-size: 17px; color: #9090a8; max-width: 540px; margin: 0 auto 12px;
          line-height: 1.6; font-weight: 400;
        }
        .home-typed {
          font-family: 'JetBrains Mono', monospace; font-size: 14px;
          color: #00e5a0; height: 22px; margin-bottom: 8px;
        }
        .home-typed::after { content: '▎'; animation: blink 0.8s step-end infinite; color: #7c5cfc; }
        @keyframes blink { 50% { opacity: 0; } }
        .home-stack {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;
          margin: 20px auto 0; max-width: 560px;
        }
        .home-stack span {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          padding: 3px 10px; border-radius: 99px;
          color: #6b6b80; border: 1px solid #1e1e2a; background: #13131a;
          transition: all 0.2s;
        }
        .home-stack span:hover { color: #e0e0e8; border-color: #7c5cfc40; background: #7c5cfc10; }

        /* Cards grid */
        .home-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px; margin-top: 40px;
        }
        .home-card {
          display: block; text-decoration: none; color: inherit;
          background: #13131a; border: 1px solid #1e1e2a; border-radius: 16px;
          padding: 24px; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .home-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--card-color); opacity: 0; transition: opacity 0.3s;
        }
        .home-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); border-color: #2a2a3a; }
        .home-card:hover::before { opacity: 1; }
        .home-card-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
        .home-card-icon { font-size: 32px; flex-shrink: 0; margin-top: 2px; }
        .home-card-name { font-size: 18px; font-weight: 700; color: #e0e0e8; margin: 0; }
        .home-card-origin { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--card-color); }
        .home-card-tagline { font-size: 13px; color: #6b6b80; margin-bottom: 10px; }
        .home-card-desc { font-size: 12px; color: #6b6b80; line-height: 1.6; margin-bottom: 14px; }
        .home-card-stack { display: flex; flex-wrap: wrap; gap: 4px; }
        .home-card-stack span {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          padding: 2px 8px; border-radius: 6px;
          color: var(--card-color); border: 1px solid color-mix(in srgb, var(--card-color) 20%, transparent);
          background: color-mix(in srgb, var(--card-color) 5%, transparent);
        }
        .home-card-link {
          margin-top: 14px; font-size: 12px; font-weight: 600;
          color: var(--card-color); display: flex; align-items: center; gap: 4px;
        }

        /* Section label */
        .home-section-label {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          letter-spacing: 3px; text-transform: uppercase;
          color: #6b6b80; text-align: center; margin-top: 48px;
        }
      `}</style>

      <div>
        {/* Hero */}
        <header className="home-hero">
          <h1>NEXUS DevLab</h1>
          <p className="subtitle">
            Six projets full-stack. Un écosystème unifié.<br />
            Ce lab rassemble les technologies maîtrisées à travers 3 ans de formation en informatique.
          </p>
          <div className="home-typed">{typedText}</div>
          <div className="home-stack">
            {STACK_HIGHLIGHTS.map((s) => <span key={s}>{s}</span>)}
          </div>
        </header>

        {/* Section title */}
        <p className="home-section-label">— 6 Modules —</p>

        {/* Project cards */}
        <div className="home-grid">
          {PROJECTS.map((p) => (
            <Link key={p.name} to={p.to} className="home-card" style={{ "--card-color": p.color }}>
              <div className="home-card-head">
                <span className="home-card-icon">{p.icon}</span>
                <div>
                  <h3 className="home-card-name">{p.name}</h3>
                  <span className="home-card-origin">Projet : {p.origin}</span>
                </div>
              </div>
              <p className="home-card-tagline">{p.tagline}</p>
              <p className="home-card-desc">{p.description}</p>
              <div className="home-card-stack">
                {p.stack.map((t) => <span key={t}>{t}</span>)}
              </div>
              <div className="home-card-link">Ouvrir le module →</div>
            </Link>
          ))}
        </div>

        {/* Stack section */}
        <p className="home-section-label" style={{marginTop: 56}}>— Stack Complète —</p>
        <div style={{marginTop: 20}}>
          <StackGrid />
        </div>
      </div>
    </>
  );
}

/* Stack grid – simplified, no separate component file needed */
const CATEGORIES = [
  { label: "Frontend", color: "#00e5a0", techs: ["React 18/19", "Next.js 16", "Tailwind CSS", "Axios", "Vite", "React Router", "Blade", "Razor Views", "Bootstrap 5", "Leaflet"] },
  { label: "Backend", color: "#7c5cfc", techs: ["Express.js", "Node.js", "Django/DRF", "Spring Boot", "Java", "Python", "PHP 8.2", "Laravel 12", "Eloquent", "C#", "ASP.NET Core 8", "MVC", "FastAPI", "PyTorch/LSTM"] },
  { label: "Auth & Sécurité", color: "#fbbf24", techs: ["JWT", "bcryptjs", "NextAuth", "AES-256/CryptoJS", "Sessions PHP", "Account Locking", "DAO/VO", "CORS", "Data Annotations"] },
  { label: "Bases de données", color: "#ff6b6b", techs: ["MongoDB", "Mongoose", "SQLite", "MySQL/PDO", "SQL Server", "EF Core", "Migrations EF"] },
  { label: "Protocoles & Outils", color: "#38bdf8", techs: ["REST API", "SOAP/XML", "Socket.IO", "WebSockets", "xml2js", "XAMPP", "Artisan CLI", "ViewModel", "LoRa/ESP32", "TDMA", "PlatformIO"] },
];

function StackGrid() {
  return (
    <div style={{marginBottom: 40}}>
      {CATEGORIES.map((cat) => (
        <div key={cat.label} style={{marginBottom: 20}}>
          <h4 style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: cat.color, marginBottom: 8}}>
            {cat.label}
          </h4>
          <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
            {cat.techs.map((t) => (
              <span key={t} style={{
                fontSize: 13, fontWeight: 500, padding: "5px 12px", borderRadius: 8,
                background: "#13131a", border: `1px solid ${cat.color}20`, color: "#e0e0e8",
                transition: "all 0.2s",
              }}>{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
