import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

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
  const [open, setOpen] = useState(false);

  // Ferme le menu mobile à chaque changement de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Verrouille le scroll body quand le menu mobile est ouvert
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Fermer le menu sur Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (n) =>
    `px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
      pathname === n.to
        ? `bg-nexus-surface ${n.color || "text-white"} border border-nexus-border`
        : "text-nexus-muted hover:text-nexus-text"
    }`;

  const mobileLinkClass = (n) =>
    `block px-4 py-3 rounded-md text-sm font-semibold transition-colors ${
      pathname === n.to
        ? `bg-nexus-surface ${n.color || "text-white"} border border-nexus-border`
        : "text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface/60"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-nexus-bg/80 backdrop-blur-md border-b border-nexus-border">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          to="/"
          className="font-mono font-bold text-sm tracking-widest uppercase text-nexus-text hover:text-white transition-colors"
        >
          NEXUS
        </Link>

        {/* Desktop : liens visibles à partir de md (≥ 768px) */}
        <div className="hidden md:flex gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={linkClass(n)}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Burger : visible < md */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-nexus-text hover:bg-nexus-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-purple"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="nexus-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {/* Hamburger / Close en SVG (3 lignes ↔ X) */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Panneau mobile — slide-down sous la navbar */}
      <div
        id="nexus-mobile-menu"
        className={`md:hidden overflow-hidden border-t border-nexus-border bg-nexus-bg/95 backdrop-blur-md transition-[max-height] duration-300 ease-out ${
          open ? "max-h-[80vh]" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={mobileLinkClass(n)}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
