/**
 * Bannière "ALERTE INCENDIE" — affichée quand au moins un nœud est en `alert`.
 *
 * Reçoit les données déjà filtrées (`alertSensor`, `alertSensorId`) calculées
 * via un `useMemo` dans le parent — pas de logique métier ici.
 */
export function AlertBanner({ alertSensorId, alertSensor, onShowDetails }) {
    if (!alertSensor) return null;

    const riskPct = alertSensor.risk != null
        ? (alertSensor.risk * 100).toFixed(1)
        : '--';

    let detail = `Zone ${alertSensor.zone || '?'} — Risque : ${riskPct}% — ${alertSensor.temperature ?? '--'}°C`;
    if (alertSensor.smoke_trigger) detail += ' — 💨 FUMÉE DÉTECTÉE';

    return (
        <div className="alert-banner" role="alert">
            <div className="alert-content">
                <span className="alert-icon" aria-hidden="true">⚠️</span>
                <div>
                    <strong>ALERTE — {alertSensor.name || alertSensorId}</strong>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{detail}</div>
                </div>
            </div>
            <button
                type="button"
                className="alert-action-btn"
                onClick={() => onShowDetails?.(alertSensorId)}
            >
                Voir détails
            </button>
        </div>
    );
}
