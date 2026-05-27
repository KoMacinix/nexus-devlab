/**
 * Conversion RSSI (dBm) → niveau de signal qualitatif.
 *
 * Plages standard pour LoRa 915 MHz :
 *   > -70  : excellent (4 barres / vert)
 *   > -85  : bon       (3 barres / cyan)
 *   > -100 : passable  (2 barres / jaune)
 *   ≤ -100 : faible    (1 barre  / rouge)
 *   null   : aucun signal — toutes barres inactives
 */

const INACTIVE_LEVEL = { bars: 0, color: '#5e6a80', colorClass: 'inactive' };

export function getRSSILevel(rssi) {
    if (rssi == null) return INACTIVE_LEVEL;
    if (rssi > -70)   return { bars: 4, color: '#2ecc71', colorClass: 'active-excellent' };
    if (rssi > -85)   return { bars: 3, color: '#4fc3f7', colorClass: 'active-good' };
    if (rssi > -100)  return { bars: 2, color: '#f0b429', colorClass: 'active-fair' };
    return                   { bars: 1, color: '#e74c3c', colorClass: 'active-weak' };
}

/** Couleur CSS du badge RSSI (texte dBm) selon le niveau. */
const RSSI_BADGE_COLORS = {
    'active-excellent': 'var(--green)',
    'active-good':      '#4fc3f7',
    'active-fair':      'var(--yellow)',
    'active-weak':      'var(--red)',
    'inactive':         'var(--text-muted)',
};

export function getRSSIBadgeColor(colorClass) {
    return RSSI_BADGE_COLORS[colorClass] || 'var(--accent-cyan)';
}
