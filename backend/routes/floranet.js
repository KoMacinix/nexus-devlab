const express = require("express");
const router = express.Router();

/**
 * FloraNet — Simulation de 3 capteurs LoRa avec cycle TDMA (18s).
 * Mock data réaliste : température, humidité, fumée, RSSI, batterie, risque IA.
 *
 * Scénarios qui cyclent automatiquement :
 *   0-60s   → normal (T~22°C, H~55%, risk~0.05)
 *   60-90s  → warning sur sensor_2 (T monte, H baisse)
 *   90-120s → alert sur sensor_3 (fumée + T critique + risk>0.7)
 *   120s    → reset → recommence
 */

const SENSORS_CONFIG = [
  { id: "sensor_1", name: "LoRa nœud 1", zone: "Zone A", type: "dht22", latitude: 45.44068, longitude: -75.626631 },
  { id: "sensor_2", name: "LoRa nœud 2", zone: "Zone B", type: "dht22", latitude: 45.44148, longitude: -75.625033 },
  { id: "sensor_3", name: "LoRa nœud 3", zone: "Zone C", type: "mq2",   latitude: 45.441557, longitude: -75.624956 },
];

const GATEWAY = { id: "gateway", name: "Passerelle LoRa", zone: "Base", latitude: 45.44064, longitude: -75.626631 };

const CYCLE_DURATION = 120; // seconds for full scenario cycle

function noise(base, range) {
  return base + (Math.random() - 0.5) * range;
}

function getScenarioPhase() {
  const elapsed = (Date.now() / 1000) % CYCLE_DURATION;
  if (elapsed < 60) return "normal";
  if (elapsed < 90) return "warning";
  return "alert";
}

function generateSensorData(sensor) {
  const phase = getScenarioPhase();
  const elapsed = (Date.now() / 1000) % CYCLE_DURATION;
  const progressInPhase = phase === "normal" ? elapsed / 60 : phase === "warning" ? (elapsed - 60) / 30 : (elapsed - 90) / 30;

  let temp, hum, smoke, risk, status, smokeTrigger;

  if (phase === "normal") {
    temp = noise(22, 3);
    hum = noise(55, 8);
    smoke = sensor.type === "mq2" ? Math.floor(noise(80, 40)) : null;
    risk = noise(0.05, 0.04);
    status = "normal";
    smokeTrigger = false;
  } else if (phase === "warning") {
    if (sensor.id === "sensor_2") {
      // sensor_2 monte en température progressivement
      temp = 22 + progressInPhase * 22; // 22→44°C
      hum = 55 - progressInPhase * 38;  // 55→17%
      risk = 0.1 + progressInPhase * 0.25;
      status = "warning";
    } else {
      temp = noise(23, 3);
      hum = noise(52, 6);
      risk = noise(0.08, 0.05);
      status = "normal";
    }
    smoke = sensor.type === "mq2" ? Math.floor(noise(120, 60)) : null;
    smokeTrigger = false;
  } else {
    // alert phase
    if (sensor.id === "sensor_3") {
      temp = 45 + progressInPhase * 15; // 45→60°C
      hum = 12 - progressInPhase * 5;    // 12→7%
      smoke = Math.floor(400 + progressInPhase * 500); // 400→900
      risk = 0.7 + progressInPhase * 0.25;
      status = "alert";
      smokeTrigger = smoke >= 700;
    } else if (sensor.id === "sensor_2") {
      temp = noise(42, 3);
      hum = noise(18, 3);
      risk = noise(0.35, 0.1);
      status = "warning";
      smoke = null;
      smokeTrigger = false;
    } else {
      temp = noise(28, 4);
      hum = noise(40, 6);
      risk = noise(0.12, 0.06);
      status = "normal";
      smoke = null;
      smokeTrigger = false;
    }
  }

  // Battery simulation (slowly draining)
  const baseBat = sensor.id === "sensor_1" ? 85 : sensor.id === "sensor_2" ? 62 : 38;
  const battery = Math.max(5, Math.floor(baseBat - (elapsed / CYCLE_DURATION) * 8 + noise(0, 2)));

  // RSSI simulation
  const rssi = Math.floor(noise(-65, 20));

  return {
    name: sensor.name,
    zone: sensor.zone,
    type: sensor.type,
    temperature: Math.round(temp * 10) / 10,
    humidity: Math.round(Math.max(0, hum) * 10) / 10,
    smoke_level: smoke != null ? Math.max(0, smoke) : null,
    smoke_trigger: smokeTrigger,
    rssi,
    battery_level: battery,
    risk: Math.round(Math.min(1, Math.max(0, risk)) * 1000) / 1000,
    status,
    latitude: sensor.latitude,
    longitude: sensor.longitude,
    last_seen: new Date().toISOString(),
  };
}

// GET /api/floranet/sensors — tous les capteurs avec données live simulées
router.get("/sensors", (_req, res) => {
  const sensors = {};
  for (const s of SENSORS_CONFIG) {
    sensors[s.id] = generateSensorData(s);
  }
  res.json({
    timestamp: new Date().toISOString(),
    sensors,
    gateway: { ...GATEWAY, active: true },
    scenario: getScenarioPhase(),
    cycle_info: {
      tdma_cycle: "18s (3 × 6s slots)",
      scenario_cycle: `${CYCLE_DURATION}s`,
      phases: "normal (0-60s) → warning (60-90s) → alert (90-120s)",
    },
  });
});

// GET /api/floranet/config — configuration système
router.get("/config", (_req, res) => {
  res.json({
    sensors: SENSORS_CONFIG,
    gateway: GATEWAY,
    lstm: {
      architecture: "LSTM (3 couches × 128 unités)",
      parameters: "~334,000",
      input: "fenêtre (30, 7) features différentielles",
      features: ["delta_T", "delta_H", "delta_S", "dT/dt", "dH/dt", "dS/dt", "smoke_flag"],
      output: "score de risque ∈ [0, 1]",
    },
    tdma: { cycle_duration: 18, slot_duration: 6, num_slots: 3, watchdog: 36 },
    thresholds: {
      temp_warning: 40, temp_critical: 50,
      hum_warning: 18, hum_critical: 10,
      smoke_warning: 300, smoke_critical: 700,
      risk_warning: 0.3, risk_critical: 0.7,
    },
  });
});

// GET /api/floranet/averages — moyennes globales
router.get("/averages", (_req, res) => {
  const allData = SENSORS_CONFIG.map((s) => generateSensorData(s));
  const temps = allData.map((d) => d.temperature);
  const hums = allData.map((d) => d.humidity);
  const smokes = allData.filter((d) => d.smoke_level != null).map((d) => d.smoke_level);

  res.json({
    temp_moyenne: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
    humidite_moyenne: Math.round((hums.reduce((a, b) => a + b, 0) / hums.length) * 10) / 10,
    fumee_max: smokes.length > 0 ? Math.max(...smokes) : null,
  });
});

module.exports = router;
