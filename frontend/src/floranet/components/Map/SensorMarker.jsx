import { memo, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { SensorPopup } from './SensorPopup';
import { makeNodeIcon } from './icons';

/**
 * Marqueur d'un nœud LoRa sur la carte.
 *
 * - `useMemo` recalcule l'icône uniquement quand des champs visuellement
 *   pertinents changent, pour éviter des reconstructions inutiles.
 * - Le contenu de la popup est rendu via JSX (`<SensorPopup>`), ce qui
 *   évite définitivement le bug de closure stale connu de la version
 *   vanilla : à chaque render, React réinjecte les props fraîches.
 * - `memo()` empêche un re-render quand l'objet `sensor` est égal en
 *   valeur (le tick TDMA renvoie souvent les mêmes données pour un nœud
 *   qui n'a pas encore parlé pendant son créneau).
 */
export const SensorMarker = memo(function SensorMarkerImpl({ sensorId, sensor, onSelect }) {
    const { latitude, longitude } = sensor;

    // L'icône ne dépend que de quelques champs — on les liste explicitement
    // pour éviter une recréation coûteuse à chaque tick TDMA.
    const icon = useMemo(
        () => makeNodeIcon(sensor),
        [
            sensor.status,
            sensor.smoke_trigger,
            sensor.temperature,
            sensor.humidity,
            sensor.smoke_level,
        ],
    );

    if (latitude == null || longitude == null) return null;

    return (
        <Marker
            position={[latitude, longitude]}
            icon={icon}
            eventHandlers={{
                click: () => onSelect?.(sensorId),
            }}
        >
            <SensorPopup sensorId={sensorId} sensor={sensor} />
        </Marker>
    );
});
