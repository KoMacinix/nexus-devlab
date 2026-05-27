import { memo } from 'react';
import { MiniRSSIBars } from './MiniRSSIBars';
import { STATUS_LABELS_LIST } from '../../constants/sensors';
import {
    getDisplayName,
    getBatteryColor,
    getRiskBadgeClass,
    hasMQ2,
} from '../../utils/sensorHelpers';
import { BATTERY_LOW, SMOKE_MAX } from '../../constants/thresholds';

/**
 * Carte représentant un nœud dans la sidebar gauche.
 *
 * - Bord gauche coloré selon le statut.
 * - Affiche : zone, T°, %H, fumée (nœud 3), batterie, RSSI, risque IA.
 * - Cliquable (toute la carte) ou via le bouton "Voir détails".
 */
export const SensorItem = memo(function SensorItemImpl({ sensorId, sensor, isSelected, onSelect }) {
    const status      = sensor.status || 'normal';
    const statusClass = `status-${status}`;
    const riskPct     = sensor.risk != null ? (sensor.risk * 100).toFixed(1) : '--';
    const riskBadge   = getRiskBadgeClass(status);
    const connLabel   = STATUS_LABELS_LIST[status] || '–';
    const mq2         = hasMQ2(sensorId);

    const bat       = sensor.battery_level;
    const batColor  = getBatteryColor(bat);
    const lastSeen  = sensor.last_seen
        ? new Date(sensor.last_seen).toLocaleTimeString('fr-CA')
        : '';

    const handleSelect = () => onSelect?.(sensorId);

    // Bouton "détails" ne doit pas re-déclencher le clic du conteneur
    const handleDetailsBtn = (e) => {
        e.stopPropagation();
        onSelect?.(sensorId);
    };

    // Fumée brute (uniquement nœud 3)
    const smokeLine = mq2 && sensor.smoke_level != null
        ? <span>💨 {sensor.smoke_level}/{SMOKE_MAX}{sensor.smoke_trigger ? ' 🔥' : ''}</span>
        : null;

    const batteryLine = bat != null
        ? <span style={{ color: batColor }}>🔋 {bat}%{bat <= BATTERY_LOW ? ' ⚠' : ''}</span>
        : <span style={{ color: 'var(--text-muted)' }}>🔋 --</span>;

    return (
        <div
            className={`sensor-item ${statusClass}${isSelected ? ' selected' : ''}`}
            onClick={handleSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
        >
            <div className="sensor-header">
                <span className="sensor-id">{getDisplayName(sensorId, sensor)}</span>
                <div className="sensor-status" />
            </div>

            <div className="sensor-info">
                <span style={{ color: 'var(--text-muted)' }}>Zone : {sensor.zone || '--'}</span>
                <span style={{ fontSize: 10 }}>{connLabel}</span>
            </div>

            <div className="sensor-info">
                <span>🌡️ {sensor.temperature != null ? `${sensor.temperature}°C` : '--'}</span>
                <span>💧 {sensor.humidity    != null ? `${sensor.humidity}%`     : '--'}</span>
            </div>

            <div className="sensor-info">
                {smokeLine ?? batteryLine}
                <span className="sensor-rssi">
                    <MiniRSSIBars rssi={sensor.rssi} />
                    {sensor.rssi != null ? `${sensor.rssi} dBm` : '--'}
                </span>
            </div>

            {smokeLine && (
                <div className="sensor-info">
                    {batteryLine}
                </div>
            )}

            <div className="sensor-info" style={{ marginTop: 4 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {lastSeen && `🕐 ${lastSeen}`}
                </span>
                <span className={`risk-badge ${riskBadge}`}>Risque : {riskPct}%</span>
            </div>

            <button className="btn-details" onClick={handleDetailsBtn} type="button">
                Voir détails
            </button>
        </div>
    );
});
