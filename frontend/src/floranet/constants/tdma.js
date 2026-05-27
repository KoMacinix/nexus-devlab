/**
 * Constantes du protocole TDMA Floranet.
 *
 * - Cycle complet : 18s (3 nœuds × 6s).
 * - L'UI est rafraîchie une fois par créneau pour rester synchronisée
 *   avec le rythme physique d'arrivée des paquets LoRa.
 * - Watchdog : un nœud n'ayant rien émis depuis 2 cycles complets est
 *   considéré « disconnected » par le backend.
 */

export const TDMA_SLOT_DURATION = 6_000;   // 6 s — un créneau
export const TDMA_CYCLE         = 18_000;  // 18 s — cycle complet
export const WATCHDOG_TIMEOUT   = 36_000;  // 36 s — 2 cycles → déconnexion

export const TDMA_SLOTS = [
    { id: 1, label: 'LoRa nœud 1', range: '0–6s'  },
    { id: 2, label: 'LoRa nœud 2', range: '6–12s' },
    { id: 3, label: 'LoRa nœud 3', range: '12–18s' },
];
