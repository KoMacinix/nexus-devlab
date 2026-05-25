const CATEGORIES = [
  {
    label: "Frontend",
    color: "#00e5a0",
    techs: [
      { name: "React 18 / 19", projects: ["GeoIntel", "StockOS", "Arena"] },
      { name: "Next.js 16", projects: ["GeoIntel"] },
      { name: "Tailwind CSS", projects: ["GeoIntel"] },
      { name: "Axios", projects: ["StockOS", "NEXUS"] },
      { name: "Vite", projects: ["NEXUS"] },
      { name: "React Router", projects: ["NEXUS"] },
      { name: "Blade Templates", projects: ["Forge"] },
      { name: "Razor Views", projects: ["ShowPass"] },
      { name: "Bootstrap 5", projects: ["Forge"] },
      { name: "Leaflet / react-leaflet", projects: ["FloraNet"] },
    ],
  },
  {
    label: "Backend",
    color: "#7c5cfc",
    techs: [
      { name: "Express.js", projects: ["Arena", "NEXUS"] },
      { name: "Node.js", projects: ["Arena", "NEXUS"] },
      { name: "Django / DRF", projects: ["StockOS"] },
      { name: "Spring Boot", projects: ["GeoIntel"] },
      { name: "Java", projects: ["GeoIntel"] },
      { name: "Python", projects: ["StockOS"] },
      { name: "PHP 8.2", projects: ["Forge"] },
      { name: "Laravel 12", projects: ["Forge"] },
      { name: "Eloquent ORM", projects: ["Forge"] },
      { name: "C#", projects: ["ShowPass"] },
      { name: "ASP.NET Core 8", projects: ["ShowPass"] },
      { name: "MVC Pattern", projects: ["ShowPass", "Forge"] },
      { name: "FastAPI", projects: ["FloraNet"] },
      { name: "PyTorch / LSTM", projects: ["FloraNet"] },
    ],
  },
  {
    label: "Auth & Sécurité",
    color: "#fbbf24",
    techs: [
      { name: "JWT", projects: ["GeoIntel", "NEXUS"] },
      { name: "bcryptjs", projects: ["GeoIntel", "Forge", "NEXUS"] },
      { name: "NextAuth", projects: ["GeoIntel"] },
      { name: "AES-256 / CryptoJS", projects: ["Forge"] },
      { name: "Sessions PHP", projects: ["Forge"] },
      { name: "Account Locking", projects: ["Forge"] },
      { name: "DAO / VO Pattern", projects: ["Forge"] },
      { name: "CORS", projects: ["Arena", "NEXUS"] },
      { name: "Data Annotations", projects: ["ShowPass"] },
    ],
  },
  {
    label: "Bases de données",
    color: "#ff6b6b",
    techs: [
      { name: "MongoDB", projects: ["Arena"] },
      { name: "Mongoose", projects: ["Arena"] },
      { name: "SQLite", projects: ["StockOS", "NEXUS"] },
      { name: "MySQL / PDO", projects: ["Forge"] },
      { name: "SQL Server", projects: ["ShowPass"] },
      { name: "Entity Framework Core", projects: ["ShowPass"] },
      { name: "Migrations EF", projects: ["ShowPass"] },
    ],
  },
  {
    label: "Protocoles & Outils",
    color: "#38bdf8",
    techs: [
      { name: "REST API", projects: ["StockOS", "NEXUS"] },
      { name: "SOAP / XML", projects: ["GeoIntel"] },
      { name: "Socket.IO", projects: ["Arena"] },
      { name: "WebSockets", projects: ["Arena"] },
      { name: "xml2js", projects: ["GeoIntel", "NEXUS"] },
      { name: "XAMPP", projects: ["Forge"] },
      { name: "Artisan CLI", projects: ["Forge"] },
      { name: "ViewModel Pattern", projects: ["ShowPass"] },
      { name: "LoRa / ESP32", projects: ["FloraNet"] },
      { name: "TDMA Protocol", projects: ["FloraNet"] },
      { name: "PlatformIO", projects: ["FloraNet"] },
    ],
  },
];

const PROJECT_COLORS = {
  GeoIntel: "#00e5a0",
  StockOS: "#7c5cfc",
  Arena: "#ff6b6b",
  Forge: "#fbbf24",
  ShowPass: "#38bdf8",
  FloraNet: "#ff6b00",
  NEXUS: "#666",
};

export default function TechGalaxy() {
  return (
    <section className="mt-16">
      <h2 className="font-mono text-[11px] tracking-[3px] uppercase text-nexus-muted text-center mb-4">
        — Stack Complète —
      </h2>

      {/* Légende */}
      <div className="flex justify-center gap-4 flex-wrap mb-8">
        {Object.entries(PROJECT_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2 text-xs text-nexus-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {name}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <h4
              className="font-mono text-[11px] tracking-wider uppercase mb-2"
              style={{ color: cat.color }}
            >
              {cat.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {cat.techs.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nexus-surface border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: `${cat.color}20` }}
                >
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="flex gap-1">
                    {t.projects.map((p) => (
                      <span
                        key={p}
                        className="w-2 h-2 rounded-full"
                        style={{ background: PROJECT_COLORS[p] || cat.color }}
                        title={p}
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
