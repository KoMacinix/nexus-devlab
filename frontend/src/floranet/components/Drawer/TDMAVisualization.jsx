import { TDMA_SLOTS } from '../../constants/tdma';
import { useTDMASlot } from '../../hooks/useTDMASlot';

/**
 * Visualisation du cycle TDMA — 3 créneaux, le créneau courant est mis
 * en surbrillance via la classe `active`.
 *
 * Le timer interne (`useTDMASlot`) est suspendu via `enabled = false`
 * quand le drawer est fermé : pas de re-render inutile en arrière-plan.
 */
export function TDMAVisualization({ enabled }) {
    const activeSlot = useTDMASlot(enabled);

    return (
        <div className="drawer-tdma-info">
            <div className="tdma-title">Cycle TDMA</div>
            <div className="tdma-grid">
                {TDMA_SLOTS.map(({ id, label, range }) => (
                    <div
                        key={id}
                        className={`tdma-slot${activeSlot === id ? ' active' : ''}`}
                    >
                        <div className="tdma-dot" />
                        <span>{label}</span>
                        <small>{range}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
