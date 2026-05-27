/**
 * Badge dans le header indiquant l'état de la passerelle LoRa.
 * Considérée "active" tant qu'au moins un nœud n'est ni
 * `disconnected` ni `waiting`.
 */
export function GatewayBadge({ active }) {
    return (
        <div className={`status-badge${active ? '' : ' gateway-inactive'}`}>
            <span className="signal-icon">📡</span>
            <span>{active ? 'Passerelle active' : 'Passerelle désactivée'}</span>
        </div>
    );
}
