import { Link, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/geointel", label: "🌍 GeoIntel", color: "text-nexus-green" },
  { to: "/stockos", label: "📦 StockOS", color: "text-nexus-purple" },
  { to: "/arena", label: "📖 Tookah", color: "text-nexus-red" },
  { to: "/forge", label: "🍊 Tutti Frutti", color: "text-nexus-yellow" },
  { to: "/showpass", label: "🎫 TicketConcert", color: "text-nexus-blue" },
  { to: "/floranet", label: "🌿 FloraNet", color: "text-orange-400" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-nexus-bg/80 backdrop-blur-md border-b border-nexus-border">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-mono font-bold text-sm tracking-widest uppercase text-nexus-text hover:text-white transition-colors">
          NEXUS
        </Link>
        <div className="flex gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                pathname === n.to
                  ? `bg-nexus-surface ${n.color || "text-white"} border border-nexus-border`
                  : "text-nexus-muted hover:text-nexus-text"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
