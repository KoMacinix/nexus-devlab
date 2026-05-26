import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const PROJECTS = [
  { icon: "🌍", name: "GeoIntel", origin: "Pays", tagline: "SOAP · JWT · Spring Boot", desc: "Client SOAP pour interroger des données géopolitiques, avec authentification JWT et hachage bcrypt.", color: "#00e5a0", to: "/geointel", stack: ["Next.js", "Spring Boot", "SOAP/XML", "JWT", "bcrypt"] },
  { icon: "📦", name: "StockOS", origin: "Inventaire", tagline: "REST API · CRUD · Django", desc: "Gestion d'inventaire avec CRUD complet et liste d'achat auto quand le stock descend sous le seuil.", color: "#7c5cfc", to: "/stockos", stack: ["React", "Django/DRF", "SQLite", "Axios"] },
  { icon: "📖", name: "Tookah", origin: "Tookah", tagline: "Socket.IO · Temps réel", desc: "Quiz multijoueur en temps réel. Lobby dynamique, timer, leaderboard live, historique MongoDB.", color: "#ff6b6b", to: "/arena", stack: ["Socket.IO", "Express", "MongoDB", "Mongoose"] },
  { icon: "🍊", name: "Tutti Frutti", origin: "htdocs", tagline: "Laravel · AES · PHP Auth", desc: "Auth chiffrée AES, verrouillage de compte, CRUD produits style Laravel avec Eloquent et Blade.", color: "#fbbf24", to: "/forge", stack: ["PHP 8.2", "Laravel 12", "AES-256", "Eloquent", "MySQL"] },
  { icon: "🎫", name: "TicketConcert", origin: "TicketConcert", tagline: "ASP.NET Core · EF Core", desc: "Billetterie concert avec Entity Framework, Data Annotations, ViewModel et migrations SQL Server.", color: "#38bdf8", to: "/showpass", stack: ["C#", "ASP.NET Core 8", "EF Core", "SQL Server", "Razor"] },
  { icon: "🌿", name: "FloraNet", origin: "Floranet_v4", tagline: "IoT · LSTM · Leaflet", desc: "Détection d'incendies forestiers avec capteurs LoRa/ESP32, modèle LSTM, carte interactive et dashboard.", color: "#ff6b00", to: "/floranet", stack: ["PyTorch", "FastAPI", "LoRa", "Leaflet", "TDMA"] },
];

const TYPED_PHRASES = [
  "du SOAP au temps réel.",
  "du PHP chiffré au MVC .NET.",
  "de l'IoT au Deep Learning.",
  "6 projets. 1 écosystème.",
];

function useTypewriter(phrases, typeSpeed = 60, deleteSpeed = 30, pause = 2500) {
  const [text, setText] = useState("");

  useEffect(() => {
    let idx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer;

    const tick = () => {
      const word = phrases[idx];
      if (!deleting) {
        charIdx++;
        setText(word.slice(0, charIdx));
        if (charIdx === word.length) {
          deleting = true;
          timer = setTimeout(tick, pause);
          return;
        }
        timer = setTimeout(tick, typeSpeed);
      } else {
        charIdx--;
        setText(word.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          idx = (idx + 1) % phrases.length;
        }
        timer = setTimeout(tick, deleteSpeed);
      }
    };

    timer = setTimeout(tick, typeSpeed);
    return () => clearTimeout(timer);
  }, [phrases, typeSpeed, deleteSpeed, pause]);

  return text;
}

export default function Home() {
  const typed = useTypewriter(TYPED_PHRASES);

  return (
    <>
      <style>{`
        .home-wrap { padding-bottom: 48px; }

        /* Hero — épuré, pas d'effet exagéré */
        .hero { padding: 56px 0 24px; }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900; letter-spacing: -0.03em;
          color: #e8e8f0; margin: 0 0 14px; line-height: 1.15;
        }
        .hero-title span { color: #7c5cfc; }
        .hero-sub {
          color: #8888a0; font-size: 15px; line-height: 1.7;
          max-width: 520px; margin: 0 0 10px;
        }
        .hero-typed {
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
          color: #00e5a0; margin-top: 6px; min-height: 20px;
        }
        .hero-typed::after { content: '|'; animation: caret 0.7s step-end infinite; margin-left: 1px; color: #7c5cfc; }
        @keyframes caret { 50% { opacity: 0; } }

        /* Grid de projets */
        .projects-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: #555570; letter-spacing: 2px;
          text-transform: uppercase; margin: 36px 0 16px; padding-left: 2px;
        }
        .project-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .project-grid { grid-template-columns: 1fr; } }

        .pcard {
          display: block; text-decoration: none; color: inherit;
          background: #111118; border: 1px solid #1c1c28;
          border-radius: 12px; padding: 20px 22px;
          transition: border-color 0.25s, transform 0.2s;
          position: relative;
        }
        .pcard:hover { border-color: #333; transform: translateY(-2px); }
        .pcard-top { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
        .pcard-icon { font-size: 26px; }
        .pcard-name { font-size: 16px; font-weight: 700; color: #e0e0e8; }
        .pcard-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: var(--c); margin-top: 1px;
        }
        .pcard-desc { font-size: 12.5px; color: #6b6b80; line-height: 1.6; margin-bottom: 12px; }
        .pcard-stack { display: flex; flex-wrap: wrap; gap: 4px; }
        .pcard-stack span {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          background: #0a0a12; border: 1px solid #1c1c28;
          padding: 2px 7px; border-radius: 4px; color: #6b6b80;
        }
        .pcard-go {
          position: absolute; top: 20px; right: 20px;
          font-size: 11px; color: #444; transition: color 0.2s;
        }
        .pcard:hover .pcard-go { color: var(--c); }

        /* Stack résumé en bas */
        .stack-section { margin-top: 48px; }
        .stack-cat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .stack-cat { margin-bottom: 16px; }
        .stack-pills { display: flex; flex-wrap: wrap; gap: 5px; }
        .stack-pills span {
          font-size: 12px; padding: 4px 10px; border-radius: 6px;
          background: #111118; border: 1px solid #1c1c28; color: #9090a0;
        }
      `}</style>

      <div className="home-wrap">
        {/* Hero — texte aligné à gauche, sobre */}
        <header className="hero">
          <h1 className="hero-title">NEXUS <span>DevLab</span></h1>
          <p className="hero-sub">
            Six projets full-stack construits sur 3 ans de formation en informatique.
            Un labo unifié qui va du service SOAP au WebSocket temps réel,
            du chiffrement AES à la détection d'incendies par Deep Learning.
          </p>
          <div className="hero-typed">{typed}</div>
        </header>

        {/* Projets */}
        <div className="projects-label">Projets</div>
        <div className="project-grid">
          {PROJECTS.map((p) => (
            <Link key={p.name} to={p.to} className="pcard" style={{"--c": p.color}}>
              <div className="pcard-top">
                <span className="pcard-icon">{p.icon}</span>
                <div>
                  <div className="pcard-name">{p.name}</div>
                  <div className="pcard-tag">{p.tagline}</div>
                </div>
              </div>
              <p className="pcard-desc">{p.desc}</p>
              <div className="pcard-stack">
                {p.stack.map((s) => <span key={s}>{s}</span>)}
              </div>
              <span className="pcard-go">→</span>
            </Link>
          ))}
        </div>

        {/* Stack */}
        <div className="stack-section">
          <div className="projects-label">Stack</div>
          {[
            { label: "Frontend", color: "#00e5a0", items: ["React 18/19","Next.js","Tailwind","Axios","Vite","Blade","Razor","Bootstrap","Leaflet"] },
            { label: "Backend", color: "#7c5cfc", items: ["Express","Node.js","Django/DRF","Spring Boot","PHP 8","Laravel 12","ASP.NET Core","FastAPI","PyTorch"] },
            { label: "Auth", color: "#fbbf24", items: ["JWT","bcrypt","AES-256","Sessions PHP","NextAuth","Account Locking","Data Annotations"] },
            { label: "Données", color: "#ff6b6b", items: ["MongoDB","SQLite","MySQL","SQL Server","EF Core","Mongoose","Eloquent"] },
            { label: "Protocoles", color: "#38bdf8", items: ["REST","SOAP/XML","Socket.IO","WebSockets","LoRa","TDMA","PlatformIO"] },
          ].map((cat) => (
            <div className="stack-cat" key={cat.label}>
              <div className="stack-cat-label" style={{color: cat.color}}>{cat.label}</div>
              <div className="stack-pills">
                {cat.items.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
