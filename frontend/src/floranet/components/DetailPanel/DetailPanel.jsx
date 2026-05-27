import { SelectedSensorHeader } from './SelectedSensorHeader';
import { MetricCard }           from './MetricCard';
import { StatusSummary }        from './StatusSummary';
import {
    hasMQ2,
    getBatteryColor,
    getTempColor,
    getHumidityColor,
    getRiskColor,
    getSmokeColor,
} from '../../utils/sensorHelpers';
import {
    BATTERY_LOW,
    SMOKE_MAX,
    TEMP_MAX_DISPLAY,
} from '../../constants/thresholds';

/**
 * Sidebar droite — détails du nœud sélectionné + résumé du réseau.
 *
 * Quand aucun nœud n'est sélectionné, on affiche les cartes vides
 * (--%, --°C, etc.) — fidèle à l'écran initial de la version vanilla.
 * Le `<StatusSummary>` reste toujours visible et s'appuie sur les
 * compteurs calculés par le parent.
 */
export function DetailPanel({
    selectedSensorId,
    selectedSensor,
    summaryCounts,
    gatewayActive,
}) {
    const sensor = selectedSensor || {};
    const isMQ2  = hasMQ2(selectedSensorId);

    const bat   = sensor.battery_level;
    const temp  = sensor.temperature;
    const hum   = sensor.humidity;
    const smoke = sensor.smoke_level;
    const risk  = sensor.risk;

    const batColor   = getBatteryColor(bat);
    const tempColor  = getTempColor(temp);
    const humColor   = getHumidityColor(hum);
    const riskColor  = getRiskColor(risk);
    const smokeColor = getSmokeColor(smoke);

    return (
        <aside className="sidebar-right">
            <div className="metrics-container">
                <SelectedSensorHeader sensorId={selectedSensorId} sensor={selectedSensor} />

                {/* Batterie — couleur dynamique (texte + barre) selon le niveau */}
                <MetricCard
                    cardId="battery-card"
                    iconClass="battery-card"
                    iconEmoji="🔋"
                    title="Batterie"
                    value={bat != null ? `${bat}%` : '--%'}
                    valueClass="battery-val"
                    valueColor={batColor}
                    barClass="battery-fill"
                    barColor={batColor}
                    barPercent={bat != null ? bat : 0}
                    hint="LiPo 3.7V 2000mAh · Alerte ≤ 20%"
                    badge={
                        bat != null && bat <= BATTERY_LOW
                            ? <div className="battery-low-badge">⚠ FAIBLE</div>
                            : null
                    }
                />

                {/* Température — barre sur 0–80°C, couleur dynamique selon seuils */}
                <MetricCard
                    iconClass="temp"
                    iconEmoji="🌡️"
                    title="Température"
                    value={temp != null ? `${temp}°C` : '--°C'}
                    valueClass="temp"
                    valueColor={tempColor}
                    barClass="temp"
                    barColor={tempColor}
                    barPercent={temp != null ? (temp / TEMP_MAX_DISPLAY) * 100 : 0}
                    hint="Normal < 40°C · Vigilance ≥ 40°C · Alerte ≥ 50°C"
                />

                {/* Humidité — barre directement en %, couleur dynamique (logique INVERSE) */}
                <MetricCard
                    iconClass="humidity"
                    iconEmoji="💧"
                    title="Humidité"
                    value={hum != null ? `${hum}%` : '--%'}
                    valueClass="humidity"
                    valueColor={humColor}
                    barClass="humidity"
                    barColor={humColor}
                    barPercent={hum != null ? hum : 0}
                    hint="Normal > 18% · Vigilance ≤ 18% · Alerte ≤ 10%"
                />

                {/* Fumée — visible uniquement pour les nœuds avec MQ-2 (sensor_3),
                    couleur dynamique selon les seuils MQ-2 (valeur brute 0–4095). */}
                {isMQ2 && (
                    <MetricCard
                        cardId="smoke-card"
                        iconClass="smoke-card"
                        iconEmoji="💨"
                        title="Fumée (MQ-2)"
                        value={smoke != null ? `${smoke} / ${SMOKE_MAX}` : `-- / ${SMOKE_MAX}`}
                        valueClass="smoke-val"
                        valueColor={smokeColor}
                        barClass="smoke-fill"
                        barColor={smokeColor}
                        barPercent={smoke != null ? (smoke / SMOKE_MAX) * 100 : 0}
                        hint={`Normal < 300 · Vigilance ≥ 300 · Alerte ≥ 700 (brut / ${SMOKE_MAX})`}
                        badge={
                            sensor.smoke_trigger
                                ? <div className="smoke-trigger-badge">🔥 DÉCLENCHÉ</div>
                                : null
                        }
                    />
                )}

                {/* Risque IA — score LSTM 0–1, affiché en %, couleur dynamique selon seuils */}
                <MetricCard
                    iconClass="ai-card"
                    iconEmoji="🤖"
                    title="Score de risque IA"
                    value={risk != null ? `${(risk * 100).toFixed(1)}%` : '--%'}
                    valueClass="ai-val"
                    valueColor={riskColor}
                    barClass="ai-fill"
                    barColor={riskColor}
                    barPercent={risk != null ? risk * 100 : 0}
                    hint="Modèle LSTM — Normal < 30% · Vigilance ≥ 30% · Alerte ≥ 70%"
                />

                <StatusSummary counts={summaryCounts} gatewayActive={gatewayActive} />
            </div>
        </aside>
    );
}
