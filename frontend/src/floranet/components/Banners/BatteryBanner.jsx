/**
 * Bannière "BATTERIE FAIBLE" — affichée quand un ou plusieurs nœuds
 * connectés ont un niveau ≤ BATTERY_LOW (20%).
 *
 * Reçoit la liste déjà filtrée (`lowBatteryNodes`) du parent.
 */
export function BatteryBanner({ lowBatteryNodes }) {
    if (!lowBatteryNodes?.length) return null;

    const detail = lowBatteryNodes
        .map(([, s]) => `${s.name} (${s.battery_level}%)`)
        .join(', ');

    return (
        <div className="battery-banner" role="alert">
            <div className="alert-content">
                <span className="alert-icon" aria-hidden="true">🔋</span>
                <div>
                    <strong>BATTERIE FAIBLE</strong>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{detail}</div>
                </div>
            </div>
        </div>
    );
}
