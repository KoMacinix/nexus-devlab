const express = require("express");
const floranetAuth = require("../middleware/floranetAuth");

const router = express.Router();

/**
 * FloraNet — Simulation 3 capteurs LoRa + passerelle.
 *
 * Démo uniquement (pas de vraies sondes ESP32/LoRa ici, pas de LSTM —
 * voir Floranet_v4 original pour le vrai pipeline IA). Les valeurs sont
 * générées à la volée à chaque requête pour rester légères en mémoire
 * (pas de boucle setInterval qui survit aux idle Render).
 *
 * Scénario cyclique (120 s, re-boucle ad vitam) :
 *    0–60 s   normal   tous les nœuds en zone verte
 *   60–90 s   warning  nœud 2 s'échauffe (T monte, H descend)
 *   90–120 s  alert    nœud 3 part en feu (fumée + T critique + risque IA haut)
 *
 * Toutes les routes sont protégées par JWT Bearer côté dashboard.
 * (Le POST d'ingestion `/sensors/data` existait dans la version originale
 * pour le gateway LoRa, on ne le porte pas ici puisqu'il n'y a pas de
 * gateway derrière une démo en ligne.)
 *
 * Format de réponse strictement identique à l'API FastAPI d'origine —
 * cf. routes/sensors.py du projet Floranet_v4 — pour ne rien changer
 * côté UI.
 */

// ─── Config capteurs (calque sur backend/config.yaml du Floranet_v4) ────────
const SENSORS = [
  { id: "sensor_1", name: "LoRa nœud 1", zone: "Zone A", type: "dht22", latitude: 45.440680, longitude: -75.626631 },
  { id: "sensor_2", name: "LoRa nœud 2", zone: "Zone B", type: "dht22", latitude: 45.441480, longitude: -75.625033 },
  { id: "sensor_3", name: "LoRa nœud 3", zone: "Zone C", type: "mq2",   latitude: 45.441557, longitude: -75.624956 },
];

const GATEWAY = {
  id: "gateway", name: "Passerelle LoRa", zone: "Base",
  latitude: 45.440640, longitude: -75.626631,
};

// ─── Seuils (calque sur AlertsConfig + THRESHOLDS frontend) ─────────────────
const THRESHOLDS = {
  RISK_WARNING: 0.3,   RISK_CRITICAL: 0.7,
  TEMP_WARNING: 40,    TEMP_CRITICAL: 50,
  HUM_WARNING: 18,     HUM_CRITICAL: 10,
  SMOKE_WARNING: 300,  SMOKE_CRITICAL: 700,
  BATTERY_LOW: 20,
};

const CYCLE_DURATION_S = 120;   // durée totale du scénario démo
const TDMA_CYCLE_S = 18;        // cycle TDMA (info structurelle)
const TDMA_SLOT_S = 6;          // durée d'un slot TDMA

// Base batteries (drainent lentement sur la durée du cycle)
const BATTERY_BASE = { sensor_1: 85, sensor_2: 62, sensor_3: 38 };

// ─── Helpers ────────────────────────────────────────────────────────────────

function noise(base, range) {
  return base + (Math.random() - 0.5) * range;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function round3(v) {
  return Math.round(v * 1000) / 1000;
}

/** Détermine le statut combiné (IA + seuils physiques + connexion). */
function determineStatus(risk, temp, hum, smokeLevel, smokeTrigger) {
  if (smokeTrigger) return "alert";
  if (temp != null && temp >= THRESHOLDS.TEMP_CRITICAL) return "alert";
  if (hum != null && hum <= THRESHOLDS.HUM_CRITICAL) return "alert";
  if (smokeLevel != null && smokeLevel >= THRESHOLDS.SMOKE_CRITICAL) return "alert";
  if (risk >= THRESHOLDS.RISK_CRITICAL) return "alert";

  if (temp != null && temp >= THRESHOLDS.TEMP_WARNING) return "warning";
  if (hum != null && hum <= THRESHOLDS.HUM_WARNING) return "warning";
  if (smokeLevel != null && smokeLevel >= THRESHOLDS.SMOKE_WARNING) return "warning";
  if (risk >= THRESHOLDS.RISK_WARNING) return "warning";

  return "normal";
}

/** Phase courante du scénario démo, déterministe sur l'horloge système. */
function getScenarioPhase(elapsedS) {
  if (elapsedS < 60) return "normal";
  if (elapsedS < 90) return "warning";
  return "alert";
}

/**
 * Génère un échantillon plausible pour un capteur, en fonction du moment
 * dans le cycle démo. Pas de persistance — l'état "vit" via l'horloge.
 */
function generateSensorData(sensor) {
  const nowS = Date.now() / 1000;
  const elapsedS = nowS % CYCLE_DURATION_S;
  const phase = getScenarioPhase(elapsedS);

  // Progression locale dans la phase courante (0..1)
  let p;
  if (phase === "normal")       p = elapsedS / 60;
  else if (phase === "warning") p = (elapsedS - 60) / 30;
  else                          p = (elapsedS - 90) / 30;

  let temp, hum, smoke, risk;
  const isMQ2 = sensor.type === "mq2";

  if (phase === "normal") {
    // Conditions calmes — tout le monde est nominal
    temp = noise(22, 3);
    hum = noise(55, 8);
    smoke = isMQ2 ? Math.floor(noise(80, 40)) : null;
    risk = noise(0.05, 0.04);
  } else if (phase === "warning") {
    // Le nœud 2 commence à chauffer (sécheresse + chaleur progressive)
    if (sensor.id === "sensor_2") {
      temp = 22 + p * 22;          // 22 → 44 °C
      hum = 55 - p * 38;           // 55 → 17 %
      risk = 0.15 + p * 0.20;      // 0.15 → 0.35
    } else if (sensor.id === "sensor_3") {
      temp = noise(24, 3);
      hum = noise(48, 6);
      risk = noise(0.10, 0.05);
    } else {
      temp = noise(23, 3);
      hum = noise(52, 6);
      risk = noise(0.08, 0.05);
    }
    smoke = isMQ2 ? Math.floor(noise(140, 70)) : null;
  } else {
    // Phase ALERTE — le nœud 3 part en feu, le 2 reste en vigilance
    if (sensor.id === "sensor_3") {
      temp = 45 + p * 18;                       // 45 → 63 °C
      hum = clamp(12 - p * 6, 4, 100);          // 12 → 6 %
      smoke = Math.floor(400 + p * 500);        // 400 → 900 (passe le seuil 700)
      risk = clamp(0.72 + p * 0.23, 0, 1);      // 0.72 → 0.95
    } else if (sensor.id === "sensor_2") {
      temp = noise(42, 3);                       // reste tiède-chaud
      hum = noise(18, 3);                        // reste sec
      risk = noise(0.38, 0.08);                  // vigilance
    } else {
      temp = noise(28, 4);
      hum = noise(40, 6);
      risk = noise(0.15, 0.06);
      smoke = null;
    }
    if (sensor.id !== "sensor_3" && isMQ2) {
      smoke = Math.floor(noise(150, 80));
    }
  }

  // Borner les valeurs physiques
  temp = round1(clamp(temp, -20, 100));
  hum = round1(clamp(hum, 0, 100));
  if (smoke != null) smoke = clamp(Math.floor(smoke), 0, 4095);
  risk = round3(clamp(risk, 0, 1));

  const smokeTrigger = smoke != null && smoke >= THRESHOLDS.SMOKE_CRITICAL;
  const status = determineStatus(risk, temp, hum, smoke, smokeTrigger);

  // Batterie : drain lent sur le cycle + petit bruit
  const baseBat = BATTERY_BASE[sensor.id] ?? 70;
  const battery = Math.max(5, Math.floor(baseBat - (elapsedS / CYCLE_DURATION_S) * 8 + noise(0, 2)));

  // RSSI : variable autour de -65 dBm (LoRa 915 MHz typique)
  const rssi = Math.floor(noise(-65, 20));

  // tdma_slot : 1, 2 ou 3 selon le créneau actuel
  const slotInCycle = Math.floor((nowS % TDMA_CYCLE_S) / TDMA_SLOT_S) + 1;

  return {
    name: sensor.name,
    zone: sensor.zone,
    type: sensor.type,
    temperature: temp,
    humidity: hum,
    smoke_level: smoke,
    smoke_trigger: smokeTrigger,
    rssi,
    battery_level: battery,
    risk,
    status,
    latitude: sensor.latitude,
    longitude: sensor.longitude,
    last_seen: new Date().toISOString(),
    tdma_slot: slotInCycle,
  };
}

// ─── Routes (toutes protégées par JWT Floranet) ──────────────────────────────

// GET /api/floranet/sensors — tous les capteurs
router.get("/sensors", floranetAuth, (_req, res) => {
  const sensors = {};
  for (const s of SENSORS) sensors[s.id] = generateSensorData(s);

  const nowS = Date.now() / 1000;
  const elapsedS = nowS % CYCLE_DURATION_S;

  res.json({
    timestamp: new Date().toISOString(),
    sensors,
    gateway: { ...GATEWAY, active: true },
    scenario: getScenarioPhase(elapsedS),
    cycle_info: {
      tdma_cycle: `${TDMA_CYCLE_S}s (${SENSORS.length} × ${TDMA_SLOT_S}s slots)`,
      scenario_cycle: `${CYCLE_DURATION_S}s`,
      phases: "normal (0–60s) → warning (60–90s) → alert (90–120s)",
    },
  });
});

// GET /api/floranet/sensors/:sensorId — un capteur précis
router.get("/sensors/:sensorId", floranetAuth, (req, res) => {
  const cfg = SENSORS.find((s) => s.id === req.params.sensorId);
  if (!cfg) {
    return res.status(404).json({ detail: "Capteur non trouvé" });
  }
  const data = generateSensorData(cfg);
  res.json({ id: cfg.id, ...data, window_size: 30 });
});

// GET /api/floranet/history/:sensorId — historique mock (démo)
router.get("/history/:sensorId", floranetAuth, (req, res) => {
  const cfg = SENSORS.find((s) => s.id === req.params.sensorId);
  if (!cfg) {
    return res.status(404).json({ detail: "Capteur non trouvé" });
  }

  const limit = clamp(parseInt(req.query.limit || "100", 10), 1, 500);
  const history = [];
  const now = Date.now();

  // Simule un historique régulier toutes les 18 s (cycle TDMA)
  for (let i = limit - 1; i >= 0; i--) {
    const ts = new Date(now - i * TDMA_CYCLE_S * 1000);
    const fakeData = generateSensorData(cfg);
    history.push({
      temperature: fakeData.temperature,
      humidity: fakeData.humidity,
      smoke_level: fakeData.smoke_level,
      smoke_trigger: fakeData.smoke_trigger,
      rssi: fakeData.rssi,
      battery_level: fakeData.battery_level,
      risk: fakeData.risk,
      timestamp: ts.toISOString(),
    });
  }

  res.json({ sensor_id: cfg.id, count: history.length, history });
});

// GET /api/floranet/averages — moyennes globales (utilisé par StatsDrawer)
router.get("/averages", floranetAuth, (_req, res) => {
  const all = SENSORS.map(generateSensorData);
  const temps = all.map((d) => d.temperature).filter((v) => v != null);
  const hums = all.map((d) => d.humidity).filter((v) => v != null);
  const smokes = all.map((d) => d.smoke_level).filter((v) => v != null);

  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  res.json({
    temp_moyenne: temps.length ? round1(mean(temps)) : null,
    humidite_moyenne: hums.length ? round1(mean(hums)) : null,
    fumee_max: smokes.length ? Math.max(...smokes) : null,
  });
});

// GET /api/floranet/status — statut global du système
router.get("/status", floranetAuth, (_req, res) => {
  res.json({
    system: "operational",
    model_loaded: false,
    model_type: "LSTM (simulé pour démo)",
    model_parameters: 334000,
    database_connected: true,
    active_sensors: SENSORS.length,
    active_alerts: 0,
    total_measurements: 0,
  });
});

// GET /api/floranet/config — configuration système (public, info statique)
router.get("/config", (_req, res) => {
  res.json({
    sensors: SENSORS,
    gateway: GATEWAY,
    lstm: {
      architecture: "LSTM (3 couches × 128 unités)",
      parameters: "~334 000",
      input: "fenêtre (30, 7) features différentielles",
      features: ["delta_T", "delta_H", "delta_S", "dT/dt", "dH/dt", "dS/dt", "smoke_flag"],
      output: "score de risque ∈ [0, 1]",
    },
    tdma: {
      cycle_duration: TDMA_CYCLE_S,
      slot_duration: TDMA_SLOT_S,
      num_slots: SENSORS.length,
      watchdog: TDMA_CYCLE_S * 2,
    },
    thresholds: {
      temp_warning: THRESHOLDS.TEMP_WARNING,   temp_critical: THRESHOLDS.TEMP_CRITICAL,
      hum_warning: THRESHOLDS.HUM_WARNING,     hum_critical: THRESHOLDS.HUM_CRITICAL,
      smoke_warning: THRESHOLDS.SMOKE_WARNING, smoke_critical: THRESHOLDS.SMOKE_CRITICAL,
      risk_warning: THRESHOLDS.RISK_WARNING,   risk_critical: THRESHOLDS.RISK_CRITICAL,
      battery_low: THRESHOLDS.BATTERY_LOW,
    },
  });
});

module.exports = router;
