import { Marker, Popup } from 'react-leaflet';
import { GATEWAY_POS } from '../../constants/sensors';
import { makeGatewayIcon } from './icons';

/**
 * Marqueur de la passerelle LoRa — position fixe, popup descriptive.
 * On instancie l'icône une seule fois (pas de dépendance dynamique).
 */
const GATEWAY_ICON = makeGatewayIcon();

export function GatewayMarker() {
    return (
        <Marker
            position={GATEWAY_POS}
            icon={GATEWAY_ICON}
            zIndexOffset={1000}
        >
            <Popup className="dark-popup">
                <div style={{ fontFamily: "'Inter',sans-serif", minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 6 }}>
                        📡 Passerelle LoRa
                    </div>
                    <div style={{ fontSize: 12, color: '#4d8fff' }}>● Active — Base</div>
                    <div style={{ fontSize: 11, color: '#9aa3b5', marginTop: 6 }}>
                        Cycle TDMA : 18s / 3 nœuds
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
