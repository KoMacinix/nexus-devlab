import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { SensorMarker } from './SensorMarker';
import { GatewayMarker } from './GatewayMarker';
import {
    MAP_DEFAULT_CENTER,
    MAP_DEFAULT_ZOOM,
    MAP_FOCUS_ZOOM,
} from '../../constants/sensors';

/**
 * Carte interactive — Leaflet via `react-leaflet`.
 *
 * Bug évité ici :
 *   Quand Leaflet monte dans un conteneur dont les dimensions ne sont pas
 *   encore stables (CSS Grid en cours de résolution, breakout `width: 100vw`
 *   qui déclenche un reflow, scrollbar qui apparaît…), il calcule ses tile
 *   positions sur des dimensions partielles. Résultat : tuiles fragmentées
 *   au centre, le reste noir — même après `invalidateSize()`, qui repositionne
 *   le viewport sans recharger l'ensemble des tuiles.
 *
 * Solution :
 *   1. Wrapper avec ResizeObserver qui mesure largeur ET hauteur en pixels.
 *   2. On ne monte <MapContainer> qu'une fois qu'on a des dimensions > 0.
 *   3. On passe ces dimensions en pixels (pas en %) au style inline, donc
 *      Leaflet voit toujours une taille concrète dès son init.
 *   4. Sur changement de dimensions ultérieur (bannière, drawer, orientation),
 *      un sous-composant <MapSizeSync> appelle `invalidateSize()` ET re-passe
 *      les nouvelles dimensions sans remonter la carte (préservation du zoom
 *      et de la position).
 */
export function MapView({ sensors, selectedSensorId, onSensorSelect }) {
    const wrapperRef = useRef(null);
    const [dims, setDims] = useState(null);   // null jusqu'à la 1re mesure valide

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return undefined;

        const measure = () => {
            const r = el.getBoundingClientRect();
            const w = Math.round(r.width);
            const h = Math.round(r.height);
            if (w <= 0 || h <= 0) return;
            setDims((prev) =>
                !prev || prev.w !== w || prev.h !== h ? { w, h } : prev,
            );
        };

        // Double rAF : laisse le navigateur terminer un cycle de layout complet
        // avant la première mesure (utile pour le reflow du `width: 100vw`).
        let raf1, raf2;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(measure);
        });

        // ResizeObserver pour les changements ultérieurs (bannière, drawer,
        // resize fenêtre, changement d'orientation).
        let rafM;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(rafM);
            rafM = requestAnimationFrame(measure);
        });
        ro.observe(el);

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
            cancelAnimationFrame(rafM);
            ro.disconnect();
        };
    }, []);

    return (
        <div className="map-container" ref={wrapperRef}>
            {dims && (
                <MapContainer
                    center={MAP_DEFAULT_CENTER}
                    zoom={MAP_DEFAULT_ZOOM}
                    zoomControl
                    style={{ width: dims.w, height: dims.h }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                    />

                    <GatewayMarker />

                    {Object.entries(sensors).map(([sensorId, sensor]) => (
                        <SensorMarker
                            key={sensorId}
                            sensorId={sensorId}
                            sensor={sensor}
                            onSelect={onSensorSelect}
                        />
                    ))}

                    <MapPanController
                        selectedSensorId={selectedSensorId}
                        sensors={sensors}
                    />

                    <MapSizeSync dims={dims} />
                </MapContainer>
            )}
        </div>
    );
}

/**
 * Recentre la carte quand `selectedSensorId` change.
 * Dépend uniquement de `selectedSensorId` pour ne pas recenter
 * à chaque tick TDMA.
 */
function MapPanController({ selectedSensorId, sensors }) {
    const map = useMap();
    const sensorsRef = useRef(sensors);
    sensorsRef.current = sensors;

    useEffect(() => {
        if (!selectedSensorId) return;
        const sensor = sensorsRef.current[selectedSensorId];
        if (sensor?.latitude != null && sensor?.longitude != null) {
            map.setView([sensor.latitude, sensor.longitude], MAP_FOCUS_ZOOM);
        }
    }, [selectedSensorId, map]);

    return null;
}

/**
 * Synchronise les dimensions Leaflet ↔ wrapper React.
 *
 * Chaque fois que `dims` change (bannière, drawer, resize), on déclenche
 * `invalidateSize()` après que React ait commit le nouveau style inline
 * sur le conteneur — Leaflet relit alors la vraie taille et redessine.
 *
 * On utilise un timeout court (60 ms) plutôt qu'un rAF parce que sous certains
 * navigateurs le repaint après commit de style se fait avec un délai variable.
 */
function MapSizeSync({ dims }) {
    const map = useMap();

    useEffect(() => {
        if (!dims) return undefined;
        const t = setTimeout(
            () => map.invalidateSize({ animate: false }),
            60,
        );
        return () => clearTimeout(t);
    }, [map, dims]);

    return null;
}
