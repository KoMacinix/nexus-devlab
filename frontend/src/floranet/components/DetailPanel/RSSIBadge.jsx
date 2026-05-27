import { getRSSILevel, getRSSIBadgeColor } from '../../utils/rssiHelpers';

/**
 * Indicateur RSSI affiché dans le header du panneau de détails (sidebar droite).
 *
 * NB : la version vanilla utilisait `setAttribute('class', ...)` pour
 * contourner le fait que `.className` est read-only sur les éléments SVG
 * (en mode strict des modules ES). En JSX, on passe `className` à un
 * élément <rect> et React émet directement le bon attribut DOM — le
 * problème n'existe plus.
 */

const BAR_GEOMETRY = [
    { x: 0,    y: 12, height: 4  },
    { x: 5.5,  y: 8,  height: 8  },
    { x: 11,   y: 4,  height: 12 },
    { x: 16.5, y: 0,  height: 16 },
];

export function RSSIBadge({ rssi }) {
    const { bars, colorClass } = getRSSILevel(rssi);
    const textColor = getRSSIBadgeColor(colorClass);

    return (
        <div className="rssi-badge" style={{ color: textColor }} title="Signal radio">
            <svg className="rssi-bars" width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
                {BAR_GEOMETRY.map((g, i) => {
                    const isActive = i + 1 <= bars;
                    return (
                        <rect
                            key={i}
                            className={`rssi-bar ${isActive ? colorClass : 'inactive'}`}
                            x={g.x}
                            y={g.y}
                            width={3.5}
                            height={g.height}
                            rx={1}
                        />
                    );
                })}
            </svg>
            <span>{rssi != null ? rssi : '--'}</span>
            <span style={{ fontSize: 10 }}>dBm</span>
        </div>
    );
}
