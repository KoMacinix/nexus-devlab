import { useEffect, useRef } from 'react';

/**
 * Hook utilitaire — `setInterval` déclaratif, version Dan Abramov.
 *
 * Avantages sur un `setInterval` brut dans un `useEffect` :
 *   - Le callback peut être réassigné (par ex. selon l'état) sans
 *     redémarrer le timer (une closure stale serait sinon possible).
 *   - Si `delay` vaut `null`, le timer est suspendu (utile pour
 *     activer/désactiver dynamiquement un polling).
 *
 * @param {() => void} callback   Fonction à exécuter à chaque tick.
 * @param {number|null} delay     Intervalle en ms. `null` met en pause.
 */
export function useInterval(callback, delay) {
    const savedCallback = useRef(callback);

    // Garde la dernière référence du callback fournie sans recréer le timer
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay == null) return undefined;

        const tick = () => savedCallback.current?.();
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}
