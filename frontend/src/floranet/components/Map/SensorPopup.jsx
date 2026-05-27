import { Popup } from 'react-leaflet';
import { STATUS_LABELS_POPUP } from '../../constants/sensors';
import { getDisplayName, hasMQ2, getBatteryColor } from '../../utils/sensorHelpers';
import { BATTERY_LOW, SMOKE_MAX } from '../../constants/thresholds';

/**
 * Popup détaillée affichée au clic sur un marqueur de nœud.
 *
 * Contrairement à l'implémentation vanilla qui injectait du HTML brut
 * via `bindPopup(htmlString)` (ce qui nous a déjà coûté un bug de
 * closure stale), on rend ici du JSX. React garantit que le contenu
 * reflète toujours les `props` les plus récentes du composant parent.
 */
export function SensorPopup({ sensorId, sensor }) {
    const statusHtml = STATUS_LABELS_POPUP[sensor.status] || '–';
    const isMQ2      = hasMQ2(sensorId);

    const bat        = sensor.battery_level;
    const batColor   = getBatteryColor(bat);

    return (
        <Popup maxWidth={240}>
            <div style={{ minWidth: 180, fontFamily: "'Inter',sans-serif" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#e8eaf0' }}>
                    {getDisplayName(sensorId, sensor)}
                </div>
                <div
                    style={{ fontSize: 12, color: '#9aa3b5', marginBottom: 8 }}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: `${sensor.zone || ''} — ${statusHtml}` }}
                />

                <div style={{ fontSize: 12, borderTop: '1px solid #363c4a', paddingTop: 8 }}>
                    <PopupRow icon="🌡️" label="Température" color="#ff6b6b">
                        {sensor.temperature != null ? `${sensor.temperature}°C` : '--'}
                    </PopupRow>

                    <PopupRow icon="💧" label="Humidité" color="#4fc3f7">
                        {sensor.humidity != null ? `${sensor.humidity}%` : '--'}
                    </PopupRow>

                    {isMQ2 && sensor.smoke_level != null && (
                        <PopupRow icon="💨" label="Fumée" color="#ffb347">
                            {sensor.smoke_level}/{SMOKE_MAX}{sensor.smoke_trigger ? ' 🔥' : ''}
                        </PopupRow>
                    )}

                    {sensor.rssi != null && (
                        <PopupRow icon="📶" label="RSSI" color="#00d4ff" mono>
                            {sensor.rssi} dBm
                        </PopupRow>
                    )}

                    {bat != null && (
                        <PopupRow icon="🔋" label="Batterie" color={batColor}>
                            {bat}%{bat <= BATTERY_LOW ? ' ⚠' : ''}
                        </PopupRow>
                    )}

                    <PopupRow icon="🤖" label="Risque IA" color="#a78bfa">
                        {sensor.risk != null ? `${(sensor.risk * 100).toFixed(1)}%` : '--'}
                    </PopupRow>
                </div>
            </div>
        </Popup>
    );
}

function PopupRow({ icon, label, color, mono, children }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>{icon} {label}</span>
            <strong style={{ color, fontFamily: mono ? 'monospace' : undefined }}>
                {children}
            </strong>
        </div>
    );
}
