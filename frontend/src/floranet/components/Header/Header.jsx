import { LiveIndicator } from "./LiveIndicator";
import { LastUpdateBadge } from "./LastUpdateBadge";
import { GatewayBadge } from "./GatewayBadge";
import { DrawerTrigger } from "./DrawerTrigger";
import { auth } from "../../services/auth";

/**
 * Bandeau supérieur — Floranet.
 *
 * Reçoit les valeurs dérivées (gatewayActive, lastUpdate) et un callback
 * `onLogout` (optionnel) qui, s'il est fourni, affiche un bouton de
 * déconnexion à droite — utile quand l'utilisateur est authentifié.
 *
 * Note : le logo est servi depuis /public/floranet-logo.svg (Nexus).
 */
export function Header({ lastUpdate, gatewayActive, onOpenDrawer, onLogout }) {
  const username = auth.getUsername();

  return (
    <header className="header">
      <div className="header-brand">
        <img src="/floranet-logo.svg" alt="Floranet" className="brand-logo" />
        <h1>Floranet — Surveillance Incendies</h1>
      </div>

      <div className="header-info">
        <LiveIndicator />
        <LastUpdateBadge lastUpdate={lastUpdate} />
        <GatewayBadge active={gatewayActive} />
        <DrawerTrigger onClick={onOpenDrawer} />
        {onLogout && (
          <button
            type="button"
            className="header-logout"
            onClick={onLogout}
            title={username ? `Déconnecter ${username}` : "Déconnecter"}
          >
            ⏻
          </button>
        )}
      </div>
    </header>
  );
}
