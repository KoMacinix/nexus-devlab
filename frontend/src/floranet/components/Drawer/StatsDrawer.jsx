import { useMemo } from 'react';
import { StatCard }            from './StatCard';
import { TDMAVisualization }   from './TDMAVisualization';
import { useAverages }         from '../../hooks/useAverages';
import { TDMA_SLOT_DURATION }  from '../../constants/tdma';
import { SMOKE_MAX }           from '../../constants/thresholds';

/**
 * Drawer "Statistiques réseau" — slide depuis la droite.
 *
 * Pourquoi un overlay séparé ?
 *   Le CSS d'origine définit deux éléments distincts (`.drawer-overlay`
 *   et `.drawer`) qui se gèrent indépendamment via `.open`. On garde
 *   cette structure pour ne pas toucher aux styles.
 *
 * Polling :
 *   `useAverages(isOpen, …)` ne déclenche aucune requête tant que le
 *   drawer est fermé — on évite tout trafic réseau superflu.
 *
 * Calcul du risque IA moyen :
 *   Le backend ne fournit pas cette moyenne directement, on la dérive
 *   du cache local des capteurs côté client (cohérent avec la version
 *   vanilla originale).
 */
export function StatsDrawer({ isOpen, onClose, sensors }) {
    const { averages } = useAverages(isOpen, TDMA_SLOT_DURATION);

    // Risque IA moyen — calculé localement à partir du cache `sensors`.
    const avgRisk = useMemo(() => {
        if (!isOpen) return null;
        const risks = Object.values(sensors)
            .map((s) => s.risk)
            .filter((r) => r != null);
        if (risks.length === 0) return null;
        const mean = risks.reduce((a, b) => a + b, 0) / risks.length;
        return (mean * 100).toFixed(1);
    }, [isOpen, sensors]);

    // Formatages ne dépendant que de `averages`
    const tempStr  = averages?.temp_moyenne     != null ? `${averages.temp_moyenne}°C`     : '--°C';
    const humStr   = averages?.humidite_moyenne != null ? `${averages.humidite_moyenne}%`  : '--%';
    const smokeStr = averages?.fumee_max        != null ? `${averages.fumee_max} / ${SMOKE_MAX}` : `-- / ${SMOKE_MAX}`;
    const riskStr  = avgRisk != null ? `${avgRisk}%` : '--%';

    return (
        <>
            <div
                className={`drawer-overlay${isOpen ? ' open' : ''}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <aside
                className={`drawer${isOpen ? ' open' : ''}`}
                aria-hidden={!isOpen}
                aria-label="Statistiques réseau"
            >
                <div className="drawer-header">
                    <h2 className="drawer-title">📊 Statistiques réseau</h2>
                    <button
                        type="button"
                        className="drawer-close"
                        onClick={onClose}
                        aria-label="Fermer le panneau"
                    >
                        ✕
                    </button>
                </div>

                <div className="drawer-body">
                    <StatCard
                        label="🌡️ Température Moyenne"
                        value={tempStr}
                        sub="Moyenne sur tous les nœuds actifs"
                    />
                    <StatCard
                        label="💧 Humidité Moyenne"
                        value={humStr}
                        sub="Humidité relative du réseau"
                    />
                    <StatCard
                        variant="smoke"
                        label="💨 Fumée Max (MQ-2)"
                        value={smokeStr}
                        sub="Valeur maximale brute (LoRa nœud 3)"
                    />
                    <StatCard
                        label="🤖 Risque IA Moyen"
                        value={riskStr}
                        sub="Score LSTM moyen du réseau"
                    />

                    <TDMAVisualization enabled={isOpen} />
                </div>
            </aside>
        </>
    );
}
