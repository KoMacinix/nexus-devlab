import { useEffect, useState } from 'react';
import { TDMA_CYCLE, TDMA_SLOT_DURATION } from '../constants/tdma';

/**
 * Renvoie l'identifiant du créneau TDMA actuellement actif (1, 2 ou 3),
 * basé sur l'horloge système modulo 18 s.
 *
 * Mise à jour ~toutes les secondes — précis pour de la visualisation
 * (point lumineux qui glisse de slot en slot dans le drawer).
 *
 * @param {boolean} enabled Active le calcul (suspendu si l'observateur
 *                          n'est pas visible — drawer fermé).
 */
export function useTDMASlot(enabled = true) {
    const [activeSlot, setActiveSlot] = useState(() => computeActiveSlot());

    useEffect(() => {
        if (!enabled) return undefined;

        // Recalcul immédiat (sinon affichage figé en attendant le 1er tick)
        setActiveSlot(computeActiveSlot());

        const id = setInterval(() => {
            setActiveSlot(computeActiveSlot());
        }, 1000);

        return () => clearInterval(id);
    }, [enabled]);

    return activeSlot;
}

function computeActiveSlot() {
    const cycleSec = (Date.now() / 1000) % (TDMA_CYCLE / 1000);
    const slotSec  = TDMA_SLOT_DURATION / 1000;
    if (cycleSec < slotSec)     return 1;
    if (cycleSec < slotSec * 2) return 2;
    return 3;
}
