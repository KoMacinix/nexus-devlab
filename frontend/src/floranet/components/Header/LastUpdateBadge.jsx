/**
 * Badge "Dernière mise à jour" — formate l'horodatage du dernier
 * fetch réussi, ou affiche `--:--:--` en attente.
 */
export function LastUpdateBadge({ lastUpdate }) {
    const formatted = lastUpdate
        ? lastUpdate.toLocaleTimeString('fr-CA')
        : '--:--:--';

    return (
        <div className="last-update-badge">
            <span id="last-update-label">Dernière mise à jour :</span>
            <span className="update-time">{formatted}</span>
        </div>
    );
}
