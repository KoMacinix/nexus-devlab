/**
 * Carte de statistique dans le drawer "Statistiques réseau".
 * `variant="smoke"` ajoute la classe `smoke-stat` (bord gauche orange).
 */
export function StatCard({ label, value, sub, variant }) {
    const className = `stat-card${variant === 'smoke' ? ' smoke-stat' : ''}`;
    return (
        <div className={className}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
        </div>
    );
}
