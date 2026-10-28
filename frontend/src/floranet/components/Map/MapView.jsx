import { useEffect, useRef } from 'react';
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
 * Dimensionnement :
 *   La carte occupe 100 % de `.map-container`, dont la taille ne dépend que
 *   du viewport (zone de la grille sur desktop, hauteur en vh sur mobile).
 *   Leaflet suit lui-même les redimensionnements de la fenêtre (option
 *   `trackResize`, active par défaut) : aucune mesure manuelle n'est
 *   nécessaire.
 *
 *   Ne pas passer de dimensions en pixels via `style` : <MapContainer> ne lit
 *   `style` qu'au montage, la carte resterait figée à sa taille initiale.
 *
 * Prérequis : `leaflet/dist/leaflet.css` (importé dans App.jsx). Sans lui,
 * les tuiles ne sont pas positionnées en absolu et s'éparpillent dans le
 * conteneur.
 */
export function MapView({ sensors, selectedSensorId, onSensorSelect }) {
    return (
        <div className="map-container">
            <MapContainer
                center={MAP_DEFAULT_CENTER}
                zoom={MAP_DEFAULT_ZOOM}
                zoomControl
                style={{ width: '100%', height: '100%' }}
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
            </MapContainer>
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
