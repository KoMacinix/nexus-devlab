import { getRSSILevel } from '../../utils/rssiHelpers';

/**
 * Mini-indicateur RSSI (4 barres) — utilisé dans chaque carte de la
 * liste des nœuds (sidebar gauche).
 */

const HEIGHTS = [4, 7, 10, 13];
const INACTIVE_COLOR = '#3a3f4c';

export function MiniRSSIBars({ rssi }) {
    const { bars, color } = getRSSILevel(rssi);

    return (
        <svg
            width="16"
            height="13"
            viewBox="0 0 16 13"
            style={{ verticalAlign: 'middle', marginRight: 3 }}
            aria-hidden="true"
        >
            {HEIGHTS.map((h, i) => {
                const y = 13 - h;
                const fill = i < bars ? color : INACTIVE_COLOR;
                return (
                    <rect
                        key={i}
                        x={i * 4}
                        y={y}
                        width={3}
                        height={h}
                        rx={0.8}
                        fill={fill}
                    />
                );
            })}
        </svg>
    );
}
