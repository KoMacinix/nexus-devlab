/**
 * Icônes SVG des 6 projets Nexus DevLab.
 *
 * Trait fin (1.75), arrondi, taille par défaut 22 px, couleur héritée
 * via `currentColor`. Pensées comme un "set" cohérent — line-art épuré
 * pour remplacer les emojis qui faisaient un peu "auto-gen".
 *
 * Usage :
 *   <GeoIntelIcon size={20} color="#00e5a0" />
 *   <GeoIntelIcon size={20} />   // hérite la couleur du parent
 */

function Base({ size = 22, color, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* GeoIntel — globe filaire (sphère avec méridien + équateur) */
export function GeoIntelIcon(props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18" />
      <path d="M12 3a13.5 13.5 0 0 0 0 18" />
    </Base>
  );
}

/* StockOS — cube isométrique (boîte 3D) */
export function StockOSIcon(props) {
  return (
    <Base {...props}>
      <path d="M21 8.25v7.5L12 21l-9-5.25v-7.5L12 3l9 5.25z" />
      <path d="M3 8.25 12 13.5l9-5.25" />
      <path d="M12 13.5V21" />
    </Base>
  );
}

/* Tookah — bulle de chat avec 3 points (quiz multijoueur temps réel) */
export function TookahIcon(props) {
  return (
    <Base {...props}>
      <path d="M21 12a8 8 0 0 1-11.4 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z" />
      <circle cx="8.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

/* Tutti Frutti — panier d'épicerie (CRUD produits Laravel) */
export function TuttiFruttiIcon(props) {
  return (
    <Base {...props}>
      <path d="M5 8h14l-1.5 9.5a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 8z" />
      <path d="M8 8 9.5 4h5L16 8" />
      <path d="M10 12v3" />
      <path d="M14 12v3" />
    </Base>
  );
}

/* TicketConcert — ticket avec perforations */
export function TicketConcertIcon(props) {
  return (
    <Base {...props}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
      <path d="M13 6v2" />
      <path d="M13 11v2" />
      <path d="M13 16v2" />
    </Base>
  );
}

/* FloraNet — flamme (détection incendies forestiers IoT) */
export function FloraNetIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 2c1 3 4 5 4 9a4 4 0 1 1-8 0c0-1.5.7-2.5 1.5-3.5C10.2 7 12 5 12 2z" />
      <path d="M10 16a2 2 0 0 0 4 0c0-1.2-1-1.8-2-3-1 1.2-2 1.8-2 3z" />
    </Base>
  );
}

/* Map id (route /<slug>) → composant icône, pour usage dynamique */
export const ICONS_BY_SLUG = {
  geointel: GeoIntelIcon,
  stockos: StockOSIcon,
  arena: TookahIcon,
  forge: TuttiFruttiIcon,
  showpass: TicketConcertIcon,
  floranet: FloraNetIcon,
};
