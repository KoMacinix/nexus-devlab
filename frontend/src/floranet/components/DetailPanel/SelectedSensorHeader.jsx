import { RSSIBadge } from './RSSIBadge';
import { STATUS_LABELS_DETAIL } from '../../constants/sensors';
import { getDisplayName } from '../../utils/sensorHelpers';

/**
 * En-tête du panneau de détails — nom + statut + RSSI.
 * Affiche un état "vide" quand aucun nœud n'est sélectionné.
 */
export function SelectedSensorHeader({ sensorId, sensor }) {
    if (!sensor) {
        return (
            <div className="selected-sensor-header">
                <div className="selected-icon">📡</div>
                <div style={{ flex: 1 }}>
                    <div className="selected-name">Sélectionnez un nœud</div>
                    <div className="selected-status-badge normal">● En attente</div>
                </div>
            </div>
        );
    }

    const status      = sensor.status || 'normal';
    const statusLabel = STATUS_LABELS_DETAIL[status] || status.toUpperCase();
    const name        = getDisplayName(sensorId, sensor);
    const zone        = sensor.zone ? ` — ${sensor.zone}` : '';

    return (
        <div className="selected-sensor-header">
            <div className="selected-icon">📡</div>
            <div style={{ flex: 1 }}>
                <div className="selected-name">{name}{zone}</div>
                <div className={`selected-status-badge ${status}`}>● {statusLabel}</div>
            </div>
            <RSSIBadge rssi={sensor.rssi} />
        </div>
    );
}
