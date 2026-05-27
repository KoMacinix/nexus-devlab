import { clampPercent } from '../../utils/sensorHelpers';

/**
 * Carte de métrique générique — réutilisée pour batterie, température,
 * humidité, fumée et risque IA. Les variantes visuelles sont contrôlées
 * via les classes CSS (`temp`, `humidity`, `smoke-fill`, etc.).
 *
 * Pour la batterie spécifiquement, la couleur du texte ET de la barre
 * doivent suivre dynamiquement le niveau (rouge/jaune/vert). On accepte
 * donc des `valueColor` et `barColor` optionnels qui surchargent les
 * couleurs définies dans le CSS — c'est le seul "couplage inline" et il
 * est intentionnel (cf. l'historique du bug v5 sur ce point précis :
 * la valeur restait verte même quand la batterie tombait à 15%).
 */
export function MetricCard({
    iconClass,
    iconEmoji,
    title,
    value,
    valueClass,
    valueColor,
    barClass,
    barColor,
    barPercent,
    hint,
    badge = null,
    cardId,            // id optionnel — utile pour conserver les hooks CSS du HTML d'origine
}) {
    return (
        <div className="metric-card" id={cardId}>
            <div className="metric-header">
                <div className={`metric-icon ${iconClass}`} aria-hidden="true">{iconEmoji}</div>
                <div className="metric-title">{title}</div>
                {badge}
            </div>

            <div
                className={`metric-value ${valueClass}`}
                style={valueColor ? { color: valueColor } : undefined}
            >
                {value}
            </div>

            <div className="chart-bar">
                <div
                    className={`chart-fill ${barClass}`}
                    style={{
                        width: `${clampPercent(barPercent)}%`,
                        ...(barColor ? { background: barColor } : {}),
                    }}
                />
            </div>

            {hint && <div className="metric-hint">{hint}</div>}
        </div>
    );
}
