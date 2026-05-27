import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useInterval } from './useInterval';

/**
 * Récupère les moyennes réseau (`/api/averages`) — uniquement quand le
 * drawer "Statistiques" est ouvert (passer `enabled = false` pour suspendre
 * le polling et économiser des requêtes).
 *
 * @param {boolean} enabled            Active le polling.
 * @param {number}  pollIntervalMs     Intervalle de rafraîchissement.
 */
export function useAverages(enabled, pollIntervalMs) {
    const [averages, setAverages] = useState(null);
    const [error, setError]       = useState(null);
    const abortRef                = useRef(null);

    const refresh = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const data = await api.getAverages({ signal: controller.signal });
            if (!controller.signal.aborted) {
                setAverages(data);
                setError(null);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('[useAverages]', err.message);
                setError(err.message);
            }
        }
    }, []);

    // Fetch immédiat à l'ouverture, reset à la fermeture
    useEffect(() => {
        if (enabled) {
            refresh();
        } else {
            abortRef.current?.abort();
        }
        return () => abortRef.current?.abort();
    }, [enabled, refresh]);

    // Polling tant que `enabled` est vrai
    useInterval(enabled ? refresh : null, pollIntervalMs);

    return { averages, error, refresh };
}
