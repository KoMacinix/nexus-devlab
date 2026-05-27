import L from 'leaflet';
import { getNodeColor } from '../../utils/sensorHelpers';

/**
 * Génère l'icône SVG d'un nœud LoRa (Leaflet `divIcon`).
 *
 * Pourquoi pas un composant React ? Les marqueurs Leaflet attendent un
 * HTML string ou une icône native — on ne peut pas insérer du JSX
 * directement. On reste donc avec une fonction pure qui produit une
 * `L.divIcon` à partir des données du capteur.
 */
export function makeNodeIcon(sensor) {
    const c        = getNodeColor(sensor);
    const isAlert  = sensor?.status === 'alert' || sensor?.smoke_trigger;
    const glowCss  = c.glow ? `filter:drop-shadow(0 0 8px ${c.glow});` : '';

    const pulseSvg = isAlert
        ? `<circle cx="18" cy="18" r="17" fill="none" stroke="${c.fill}" stroke-width="2" opacity="0.4">
               <animate attributeName="r" from="17" to="26" dur="1.2s" repeatCount="indefinite"/>
               <animate attributeName="opacity" from="0.5" to="0" dur="1.2s" repeatCount="indefinite"/>
           </circle>`
        : '';

    return L.divIcon({
        html: `<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="${glowCss}">
            ${pulseSvg}
            <circle cx="18" cy="18" r="14" fill="${c.fill}" stroke="${c.border}" stroke-width="2.5"/>
            <circle cx="18" cy="18" r="6" fill="white" opacity="0.9"/>
            <circle cx="18" cy="18" r="3" fill="${c.fill}"/>
        </svg>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 18],
        className:  '',
    });
}

/** Icône de la passerelle LoRa (forme de "pin"). */
export function makeGatewayIcon() {
    return L.divIcon({
        html: `<svg width="44" height="52" viewBox="0 0 44 52" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2 C11 2 3 10 3 20 C3 32 22 50 22 50 C22 50 41 32 41 20 C41 10 33 2 22 2Z"
                  fill="#4d8fff" stroke="#1a6eff" stroke-width="2"/>
            <rect x="19" y="11" width="6" height="2.5" rx="1" fill="white"/>
            <rect x="20.5" y="13.5" width="3" height="10" rx="1" fill="white"/>
            <path d="M14 15 Q17 11 22 11 Q27 11 30 15"
                  fill="none" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
            <path d="M10 18 Q16 10 22 10 Q28 10 34 18"
                  fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/>
        </svg>`,
        iconSize:   [44, 52],
        iconAnchor: [22, 50],
        className:  '',
    });
}
