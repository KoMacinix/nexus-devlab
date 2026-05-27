/**
 * Helpers purs autour d'un objet `sensor` renvoyé par le backend.
 * Ces fonctions ne touchent jamais au DOM : elles renvoient des
 * primitives ou des objets simples consommés par les composants.
 */

import { NODE_NAMES, NODES_WITH_MQ2 } from '../constants/sensors';
import { THRESHOLDS, BATTERY_LOW, BATTERY_WARNING } from '../constants/thresholds';

/** Nom à afficher : on privilégie le champ `name` du backend. */
export function getDisplayName(sensorId, sensor) {
    return sensor?.name || NODE_NAMES[sensorId] || sensorId;
}

/** Vrai pour les nœuds équipés d'un MQ-2 (capteur fumée). */
export function hasMQ2(sensorId) {
    return NODES_WITH_MQ2.has(sensorId);
}

/**
 * Détermine la couleur (fond/bord/glow) d'un marqueur de nœud.
 * Réimplémente la logique d'origine de `_nodeColor` dans `map.js`,
 * mais en fonction pure (entrée/sortie).
 */
export function getNodeColor(sensor) {
    if (!sensor) return { fill: '#5e6a80', border: '#7a8aa0', glow: null };

    const status = sensor.status;

    if (status === 'disconnected') return { fill: '#6b7896', border: '#8899bb', glow: null };
    if (status === 'waiting')      return { fill: '#5e6a80', border: '#7a8aa0', glow: null };

    // Critique → Rouge
    const isCritical =
        status === 'alert' ||
        (sensor.temperature != null && sensor.temperature >= THRESHOLDS.temp_critical) ||
        (sensor.humidity    != null && sensor.humidity    <= THRESHOLDS.hum_critical)  ||
        (sensor.smoke_level != null && sensor.smoke_level >= THRESHOLDS.smoke_critical) ||
        sensor.smoke_trigger;

    if (isCritical) {
        return { fill: '#e74c3c', border: '#ff6b6b', glow: 'rgba(231,76,60,0.5)' };
    }

    // Vigilance → Jaune
    const isWarning =
        status === 'warning' ||
        (sensor.temperature != null && sensor.temperature >= THRESHOLDS.temp_warning) ||
        (sensor.humidity    != null && sensor.humidity    <= THRESHOLDS.hum_warning)  ||
        (sensor.smoke_level != null && sensor.smoke_level >= THRESHOLDS.smoke_warning);

    if (isWarning) {
        return { fill: '#f0b429', border: '#ffd166', glow: 'rgba(240,180,41,0.45)' };
    }

    // Normal → Vert
    return { fill: '#2ecc71', border: '#55efc4', glow: 'rgba(46,204,113,0.4)' };
}

/**
 * Couleur CSS associée au niveau de batterie.
 * On utilise les variables CSS définies dans `style.css`.
 */
export function getBatteryColor(bat) {
    if (bat == null)              return 'var(--text-muted)';
    if (bat <= BATTERY_LOW)       return 'var(--red)';
    if (bat <= BATTERY_WARNING)   return 'var(--yellow)';
    return 'var(--green)';
}

/**
 * Couleur CSS associée à la température.
 * Plus c'est chaud, plus c'est dangereux.
 *   < 40°C  → vert
 *   ≥ 40°C  → jaune (vigilance)
 *   ≥ 50°C  → rouge (alerte)
 */
export function getTempColor(temp) {
    if (temp == null)                          return 'var(--text-muted)';
    if (temp >= THRESHOLDS.temp_critical)      return 'var(--red)';
    if (temp >= THRESHOLDS.temp_warning)       return 'var(--yellow)';
    return 'var(--green)';
}

/**
 * Couleur CSS associée à l'humidité (logique INVERSE — basse humidité = sec = risque).
 *   > 18%  → vert
 *   ≤ 18%  → jaune (vigilance — sécheresse)
 *   ≤ 10%  → rouge (alerte — très sec)
 */
export function getHumidityColor(hum) {
    if (hum == null)                           return 'var(--text-muted)';
    if (hum <= THRESHOLDS.hum_critical)        return 'var(--red)';
    if (hum <= THRESHOLDS.hum_warning)         return 'var(--yellow)';
    return 'var(--green)';
}

/**
 * Couleur CSS associée au score de risque IA (0–1).
 *   < 0.3  → vert
 *   ≥ 0.3  → jaune (vigilance)
 *   ≥ 0.7  → rouge (alerte)
 */
export function getRiskColor(risk) {
    if (risk == null)                          return 'var(--text-muted)';
    if (risk >= THRESHOLDS.risk_critical)      return 'var(--red)';
    if (risk >= THRESHOLDS.risk_warning)       return 'var(--yellow)';
    return 'var(--green)';
}

/**
 * Couleur CSS associée au niveau de fumée (valeur brute MQ-2 sur ESP32 ADC 12 bits, 0–4095).
 * Plus c'est haut, plus c'est dangereux.
 *   < 300  → vert
 *   ≥ 300  → jaune (vigilance)
 *   ≥ 700  → rouge (alerte — déclenchement)
 */
export function getSmokeColor(smoke) {
    if (smoke == null)                          return 'var(--text-muted)';
    if (smoke >= THRESHOLDS.smoke_critical)     return 'var(--red)';
    if (smoke >= THRESHOLDS.smoke_warning)      return 'var(--yellow)';
    return 'var(--green)';
}

/** Catégorie de risque pour la coloration du badge "Risque IA" dans la liste. */
export function getRiskBadgeClass(status) {
    if (status === 'alert')   return 'alert';
    if (status === 'warning') return 'warning';
    return 'normal';
}

/** Pourcentage borné [0, 100] pour les barres de progression. */
export function clampPercent(value) {
    if (value == null || Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(100, value));
}
