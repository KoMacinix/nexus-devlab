import { SensorItem } from './SensorItem';

/**
 * Sidebar gauche — liste des nœuds LoRa du réseau.
 * Stateless : reçoit l'objet `sensors` et délègue le clic au parent.
 */
export function SensorList({ sensors, selectedSensorId, onSelect }) {
    const entries = Object.entries(sensors);

    return (
        <aside className="sidebar-left">
            <div className="sidebar-header">
                <span className="sidebar-icon">📡</span>
                <span>Nœuds LoRa</span>
            </div>

            <div className="sensor-list">
                {entries.length === 0 ? (
                    <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                        Aucun nœud détecté…
                    </div>
                ) : (
                    entries.map(([sensorId, sensor]) => (
                        <SensorItem
                            key={sensorId}
                            sensorId={sensorId}
                            sensor={sensor}
                            isSelected={sensorId === selectedSensorId}
                            onSelect={onSelect}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}
