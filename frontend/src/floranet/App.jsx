import { useCallback, useEffect, useMemo, useState } from "react";

import { Header } from "./components/Header/Header";
import { AlertBanner } from "./components/Banners/AlertBanner";
import { BatteryBanner } from "./components/Banners/BatteryBanner";
import { SensorList } from "./components/SensorList/SensorList";
import { MapView } from "./components/Map/MapView";
import { DetailPanel } from "./components/DetailPanel/DetailPanel";
import { StatsDrawer } from "./components/Drawer/StatsDrawer";
import { Login } from "./components/Login/Login";

import { useSensors } from "./hooks/useSensors";
import { TDMA_SLOT_DURATION } from "./constants/tdma";
import { BATTERY_LOW } from "./constants/thresholds";
import { auth, UNAUTH_EVENT } from "./services/auth";

import "./styles/style.css";

/**
 * App Floranet — composant racine de la sous-app (montée par pages/FloraNet.jsx).
 *
 * Sécurité : l'application n'est rendue qu'une fois `auth.isAuthenticated()`
 * vrai. Sur 401 d'une requête API, services/api.js émet UNAUTH_EVENT qui
 * fait basculer l'état `authenticated` à false → on réaffiche <Login/>.
 *
 * Logique strictement identique au Floranet_v4 original (App.jsx).
 */
export default function FloranetApp() {
  const [authenticated, setAuthenticated] = useState(() => auth.isAuthenticated());

  useEffect(() => {
    const onUnauth = () => setAuthenticated(false);
    window.addEventListener(UNAUTH_EVENT, onUnauth);
    return () => window.removeEventListener(UNAUTH_EVENT, onUnauth);
  }, []);

  const handleLoginSuccess = useCallback(() => setAuthenticated(true), []);
  const handleLogout = useCallback(() => {
    auth.logout();
    setAuthenticated(false);
  }, []);

  if (!authenticated) {
    return (
      <div className="floranet-root">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="floranet-root">
      <Dashboard onLogout={handleLogout} />
    </div>
  );
}

/**
 * Dashboard authentifié — extrait dans un sous-composant pour que
 * `useSensors` ne déclenche AUCUN polling tant que l'utilisateur n'est
 * pas connecté (sinon on essaierait d'appeler /api/floranet/sensors sans
 * token et on déclencherait une boucle 401 / redirect).
 */
function Dashboard({ onLogout }) {
  const { sensors, lastUpdate } = useSensors(TDMA_SLOT_DURATION);

  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSensorSelect = useCallback((sensorId) => {
    setSelectedSensorId(sensorId);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const selectedSensor = useMemo(
    () => (selectedSensorId ? sensors[selectedSensorId] || null : null),
    [sensors, selectedSensorId],
  );

  const alertEntry = useMemo(() => {
    const found = Object.entries(sensors).find(([, s]) => s.status === "alert");
    return found || null;
  }, [sensors]);

  const lowBatteryNodes = useMemo(
    () =>
      Object.entries(sensors).filter(
        ([, s]) =>
          s.battery_level != null &&
          s.battery_level <= BATTERY_LOW &&
          s.status !== "disconnected",
      ),
    [sensors],
  );

  const summaryCounts = useMemo(() => {
    const counts = { normal: 0, warning: 0, alert: 0, disconnected: 0 };
    for (const s of Object.values(sensors)) {
      if (s.status === "alert") counts.alert++;
      else if (s.status === "warning") counts.warning++;
      else if (s.status === "disconnected") counts.disconnected++;
      else counts.normal++;
    }
    return counts;
  }, [sensors]);

  const gatewayActive = useMemo(
    () =>
      Object.values(sensors).some(
        (s) => s.status !== "disconnected" && s.status !== "waiting",
      ),
    [sensors],
  );

  return (
    <>
      <Header
        lastUpdate={lastUpdate}
        gatewayActive={gatewayActive}
        onOpenDrawer={openDrawer}
        onLogout={onLogout}
      />

      {alertEntry && (
        <AlertBanner
          alertSensorId={alertEntry[0]}
          alertSensor={alertEntry[1]}
          onShowDetails={handleSensorSelect}
        />
      )}

      <BatteryBanner lowBatteryNodes={lowBatteryNodes} />

      <div className="dashboard-container">
        <SensorList
          sensors={sensors}
          selectedSensorId={selectedSensorId}
          onSelect={handleSensorSelect}
        />

        <MapView
          sensors={sensors}
          selectedSensorId={selectedSensorId}
          onSensorSelect={handleSensorSelect}
        />

        <DetailPanel
          selectedSensorId={selectedSensorId}
          selectedSensor={selectedSensor}
          summaryCounts={summaryCounts}
          gatewayActive={gatewayActive}
        />
      </div>

      <StatsDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        sensors={sensors}
      />
    </>
  );
}
