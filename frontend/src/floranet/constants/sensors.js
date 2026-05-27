/**
 * Identité des nœuds LoRa et métadonnées associées.
 *
 * Le backend renvoie déjà le champ `name`, mais en cas d'absence
 * (premier paquet, état "waiting", etc.) on retombe sur ces noms.
 */

/** Noms lisibles par défaut pour chaque nœud. */
export const NODE_NAMES = {
    sensor_1: 'LoRa nœud 1',
    sensor_2: 'LoRa nœud 2',
    sensor_3: 'LoRa nœud 3',
};

/** Position physique de la passerelle LoRa (à ajuster selon déploiement). */
export const GATEWAY_POS = [45.440680, -75.626531];

/** Centre de la carte au chargement. */
export const MAP_DEFAULT_CENTER = [45.4387, -75.6283];
export const MAP_DEFAULT_ZOOM   = 17;
export const MAP_FOCUS_ZOOM     = 18;

/** Quels nœuds embarquent un MQ-2 (capteur de fumée analogique). */
export const NODES_WITH_MQ2 = new Set(['sensor_3']);

/** Étiquettes de statut pour la liste de nœuds (sidebar gauche). */
export const STATUS_LABELS_LIST = {
    normal:       '✓ Connecté',
    warning:      '⚠ Connecté',
    alert:        '🔥 Connecté',
    disconnected: '✕ Déconnecté',
    waiting:      '⏳ En attente',
};

/** Étiquettes de statut pour le badge du panneau de détails. */
export const STATUS_LABELS_DETAIL = {
    normal:       '✓ NORMAL',
    warning:      '⚠ VIGILANCE',
    alert:        '🔥 ALERTE',
    disconnected: '✕ DÉCONNECTÉ',
    waiting:      '⏳ EN ATTENTE',
};

/** Étiquettes de statut pour la popup carte (HTML inline). */
export const STATUS_LABELS_POPUP = {
    normal:       '<span style="color:#2ecc71">● Normal</span>',
    warning:      '<span style="color:#f0b429">● Vigilance</span>',
    alert:        '<span style="color:#e74c3c">🔥 ALERTE</span>',
    disconnected: '<span style="color:#6b7896">✕ Déconnecté</span>',
    waiting:      '<span style="color:#5e6a80">⏳ En attente</span>',
};
