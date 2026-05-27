import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useInterval } from './useInterval';

/**
 * Hook principal — récupération périodique des données capteurs.
 *
 * Aligné sur le créneau TDMA (par défaut 6 s) : les paquets LoRa
 * arrivent par bloc, on rafraîchit donc une fois par créneau pour
 * rester en phase avec le rythme physique du réseau.
 *
 * Particularités :
 *   - 1er fetch immédiat au montage.
 *   - `AbortController` pour annuler la requête en cours si le
 *     composant est démonté ou si un nouveau cycle commence.
 *   - L'erreur la plus récente est exposée mais n'écrase pas les
 *     dernières données reçues (UI reste utilisable en cas de blip).
 *
 * @param {number} pollIntervalMs Intervalle entre deux fetches.
 * @returns {{
 *   sensors: Record<string, object>,
 *   lastUpdate: Date|null,
 *   error: string|null,
 *   isLoading: boolean,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useSensors(pollIntervalMs) {
    const [sensors, setSensors]       = useState({});
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError]           = useState(null);
    const [isLoading, setIsLoading]   = useState(true);

    const abortRef = useRef(null);

    const refresh = useCallback(async () => {
        // Annule la requête en cours si elle n'a pas encore résolu
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const data = await api.getAllSensors({ signal: controller.signal });
            // Garde-fou : ne mettre à jour que si on n'a pas été aborté
            if (!controller.signal.aborted) {
                setSensors(data.sensors || {});
                setLastUpdate(new Date());
                setError(null);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('[useSensors]', err.message);
                setError(err.message);
            }
        } finally {
            if (!controller.signal.aborted) setIsLoading(false);
        }
    }, []);

    // Premier fetch au montage
    useEffect(() => {
        refresh();
        return () => abortRef.current?.abort();
    }, [refresh]);

    // Polling périodique
    useInterval(refresh, pollIntervalMs);

    return { sensors, lastUpdate, error, isLoading, refresh };
}
