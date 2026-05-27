/**
 * Résumé du réseau — afficheur des compteurs par statut + état passerelle.
 * Toutes les valeurs viennent du parent (déjà calculées via `useMemo`).
 */
export function StatusSummary({ counts, gatewayActive }) {
    return (
        <div className="status-summary">
            <div className="summary-title">Résumé du réseau</div>

            <SummaryRow label="Nœuds normaux"     value={counts.normal}       colorClass="green"  />
            <SummaryRow label="Nœuds en vigilance" value={counts.warning}      colorClass="orange" />
            <SummaryRow label="Nœuds en alerte"    value={counts.alert}        colorClass="red"    />
            <SummaryRow label="Déconnectés"        value={counts.disconnected} colorClass="grey"   />

            <div className="status-row divider">
                <span>Passerelle LoRa</span>
                <span className={gatewayActive ? 'gateway-live' : 'gateway-off'}>
                    ● {gatewayActive ? 'Active' : 'Désactivée'}
                </span>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, colorClass }) {
    return (
        <div className="status-row">
            <span>{label}</span>
            <span className={`status-count ${colorClass}`}>{value}</span>
        </div>
    );
}
