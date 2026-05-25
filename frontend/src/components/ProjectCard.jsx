import { Link } from "react-router-dom";

export default function ProjectCard({ icon, name, origin, tagline, description, color, to, stack }) {
  return (
    <Link
      to={to}
      className="glow-card block bg-nexus-surface border border-nexus-border rounded-2xl p-6 group"
      style={{ "--ac": color }}
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-opacity-100 transition-colors">
            {name}
          </h3>
          <p className="font-mono text-[10px] tracking-wide" style={{ color }}>
            Projet : {origin}
          </p>
        </div>
      </div>

      <p className="text-sm text-nexus-muted mb-3">{tagline}</p>
      <p className="text-xs text-nexus-muted leading-relaxed mb-4">{description}</p>

      <div className="flex flex-wrap gap-1.5">
        {stack.map((t) => (
          <span
            key={t}
            className="font-mono text-[10px] px-2 py-0.5 rounded border"
            style={{
              color,
              borderColor: `${color}30`,
              background: `${color}08`,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div
        className="mt-4 text-xs font-semibold flex items-center gap-1 transition-colors"
        style={{ color }}
      >
        Ouvrir le module →
      </div>
    </Link>
  );
}
