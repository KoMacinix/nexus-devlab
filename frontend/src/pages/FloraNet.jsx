import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../api";

/* ── Original Floranet design: Semi-Dark Anthracite, Inter font, Leaflet map ── */
/* ── 3 capteurs LoRa, TDMA 18s cycle, LSTM risk score, status-based colors ── */

const GATEWAY_POS = [45.44064, -75.626631];
const MAP_CENTER = [45.4387, -75.6283];

const STATUS_COLORS = { normal: "#2ecc71", warning: "#f0b429", alert: "#e74c3c", disconnected: "#6b7896", waiting: "#5e6a80" };
const STATUS_LABELS = { normal: "✓ NORMAL", warning: "⚠ VIGILANCE", alert: "🔥 ALERTE", disconnected: "✕ DÉCONNECTÉ", waiting: "⏳ EN ATTENTE" };

function sensorIcon(status) {
  const color = STATUS_COLORS[status] || "#6b7896";
  return L.divIcon({
    className: "fn-marker",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #1a1d23;box-shadow:0 0 8px ${color}80;"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9],
  });
}

const gatewayIcon = L.divIcon({
  className: "fn-marker",
  html: `<div style="width:22px;height:22px;border-radius:4px;background:#4d8fff;border:3px solid #1a1d23;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;">📡</div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
});

function MapPan({ selectedId, sensors }) {
  const map = useMap();
  const ref = useRef(sensors);
  ref.current = sensors;
  useEffect(() => {
    if (!selectedId) return;
    const s = ref.current[selectedId];
    if (s?.latitude) map.setView([s.latitude, s.longitude], 18);
  }, [selectedId, map]);
  return null;
}

function MapFixer() {
  const map = useMap();
  useEffect(() => {
    const ts = [50, 300, 1000].map(t => setTimeout(() => map.invalidateSize(), t));
    return () => ts.forEach(clearTimeout);
  }, [map]);
  return null;
}

export default function FloraNet() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loginErr, setLoginErr] = useState("");
  const [sensors, setSensors] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [scenario, setScenario] = useState("normal");
  const [gatewayActive, setGatewayActive] = useState(false);

  // Polling every 6s (TDMA slot)
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    async function poll() {
      try {
        const res = await api.get("/floranet/sensors");
        if (!active) return;
        setSensors(res.data.sensors);
        setLastUpdate(new Date().toLocaleTimeString("fr-CA"));
        setScenario(res.data.scenario);
        setGatewayActive(res.data.gateway?.active || false);
      } catch {}
    }
    poll();
    const id = setInterval(poll, 6000);
    return () => { active = false; clearInterval(id); };
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) { setAuthenticated(true); setLoginErr(""); }
    else setLoginErr("Identifiants requis");
  };

  const selected = useMemo(() => selectedId ? sensors[selectedId] || null : null, [sensors, selectedId]);
  const alertEntry = useMemo(() => Object.entries(sensors).find(([,s]) => s.status === "alert") || null, [sensors]);
  const counts = useMemo(() => {
    const c = { normal:0, warning:0, alert:0, disconnected:0 };
    Object.values(sensors).forEach(s => { if (c[s.status] !== undefined) c[s.status]++; else c.normal++; });
    return c;
  }, [sensors]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .fn-wrap {
          --bg-base:#1a1d23; --bg-surface:#22262f; --bg-card:#2a2f3a; --bg-hover:#323848; --bg-input:#1e222a;
          --border:#363c4a; --border-light:#424a5c;
          --text-primary:#e8eaf0; --text-secondary:#9aa3b5; --text-muted:#5e6a80;
          --accent-blue:#4d8fff; --accent-cyan:#00d4ff;
          --green:#2ecc71; --yellow:#f0b429; --red:#e74c3c; --grey:#6b7896;
          --temp-color:#ff6b6b; --hum-color:#4fc3f7; --smoke-color:#ffb347; --ai-color:#a78bfa;
          --font-ui:'Inter',-apple-system,sans-serif; --font-mono:'SFMono-Regular',Consolas,monospace;
          margin:-16px; min-height:calc(100vh - 200px); font-family:var(--font-ui); background:var(--bg-base); color:var(--text-primary); overflow:hidden;
        }
        /* Header */
        .fn-header { height:58px; background:var(--bg-surface); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; padding:0 20px; box-shadow:0 2px 16px rgba(0,0,0,0.35); position:relative; z-index:100; }
        .fn-header h1 { font-size:17px; font-weight:700; }
        .fn-header-info { display:flex; gap:10px; align-items:center; }
        .fn-live { display:flex; align-items:center; gap:7px; padding:5px 12px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.25); border-radius:20px; }
        .fn-live-dot { width:8px; height:8px; border-radius:50%; background:var(--green); animation:fnPulse 1.8s ease-in-out infinite; }
        @keyframes fnPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(46,204,113,0.5)} 50%{opacity:0.7;box-shadow:0 0 0 5px rgba(46,204,113,0)} }
        .fn-badge { padding:5px 12px; background:var(--bg-card); border:1px solid var(--border); border-radius:20px; font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:5px; }
        .fn-badge .time { font-family:var(--font-mono); color:var(--accent-cyan); font-weight:600; }
        .fn-scenario { font-family:var(--font-mono); font-size:10px; padding:4px 10px; border-radius:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
        /* Alert banner */
        .fn-alert-banner { background:linear-gradient(135deg,#c0392b,#e74c3c); color:white; padding:11px 20px; display:flex; justify-content:space-between; align-items:center; animation:fnAlertPulse 1.5s infinite; }
        @keyframes fnAlertPulse { 0%,100%{background:linear-gradient(135deg,#c0392b,#e74c3c)} 50%{background:linear-gradient(135deg,#a93226,#d63031)} }
        .fn-alert-banner button { background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:white; padding:4px 12px; border-radius:15px; cursor:pointer; font-family:var(--font-ui); font-size:12px; }
        /* Dashboard layout */
        .fn-dash { display:flex; height:calc(100vh - 260px); min-height:400px; }
        /* Left sidebar */
        .fn-sidebar-l { width:256px; min-width:256px; background:var(--bg-surface); border-right:1px solid var(--border); overflow-y:auto; padding:12px; }
        .fn-sidebar-l::-webkit-scrollbar { width:4px; } .fn-sidebar-l::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .fn-sidebar-l h3 { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
        .fn-sensor-item { background:var(--bg-card); border:1px solid var(--border); border-left:3px solid var(--grey); border-radius:10px; padding:12px; margin-bottom:8px; cursor:pointer; transition:all 0.2s; }
        .fn-sensor-item:hover { background:var(--bg-hover); }
        .fn-sensor-item.selected { border-color:var(--accent-blue)!important; background:var(--bg-hover); box-shadow:0 0 0 1px var(--accent-blue); }
        .fn-sensor-item.s-normal { border-left-color:var(--green); } .fn-sensor-item.s-warning { border-left-color:var(--yellow); }
        .fn-sensor-item.s-alert { border-left-color:var(--red); background:rgba(231,76,60,0.06); } .fn-sensor-item.s-disconnected { border-left-color:var(--grey); opacity:0.6; }
        .fn-sensor-name { font-weight:600; font-size:13px; margin-bottom:4px; }
        .fn-sensor-info { display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:3px; }
        .fn-risk-badge { font-size:10px; font-weight:600; padding:2px 8px; border-radius:10px; }
        .fn-risk-normal { background:rgba(46,204,113,0.12); color:var(--green); }
        .fn-risk-warning { background:rgba(240,180,41,0.12); color:var(--yellow); }
        .fn-risk-alert { background:rgba(231,76,60,0.12); color:var(--red); }
        /* Map */
        .fn-map { flex:1; position:relative; }
        .fn-map .leaflet-container { width:100%; height:100%; }
        /* Right sidebar */
        .fn-sidebar-r { width:294px; min-width:294px; background:var(--bg-surface); border-left:1px solid var(--border); overflow-y:auto; padding:14px; }
        .fn-metric { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:12px 14px; margin-bottom:8px; }
        .fn-metric:hover { border-color:var(--border-light); }
        .fn-metric-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .fn-metric-title { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:6px; }
        .fn-metric-val { font-family:var(--font-mono); font-size:22px; font-weight:700; margin-bottom:6px; }
        .fn-metric-bar { height:4px; background:var(--bg-input); border-radius:2px; overflow:hidden; }
        .fn-metric-fill { height:100%; border-radius:2px; transition:width 0.5s; }
        .fn-metric-hint { font-size:10px; color:var(--text-muted); margin-top:6px; }
        /* Status summary */
        .fn-summary { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:12px; }
        .fn-summary h4 { font-size:12px; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px; }
        .fn-summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
        .fn-summary-item { text-align:center; padding:8px; border-radius:8px; }
        .fn-summary-item .count { font-size:20px; font-weight:700; font-family:var(--font-mono); }
        .fn-summary-item .label { font-size:10px; color:var(--text-muted); }
        /* Login */
        .fn-login-screen { background:var(--bg-base); min-height:calc(100vh - 200px); display:flex; align-items:center; justify-content:center; margin:-16px; font-family:var(--font-ui); }
        .fn-login-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:16px; padding:32px; max-width:380px; width:100%; box-shadow:0 16px 48px rgba(0,0,0,0.4); }
        .fn-login-card h1 { text-align:center; font-size:24px; color:#e8eaf0; margin:8px 0 4px; }
        .fn-login-card .sub { text-align:center; color:var(--text-muted); font-size:13px; margin-bottom:20px; }
        .fn-login-card label { display:block; margin-bottom:12px; }
        .fn-login-card label span { display:block; font-size:12px; color:var(--text-secondary); margin-bottom:4px; }
        .fn-login-card input { width:100%; padding:10px 14px; background:var(--bg-input); border:1px solid var(--border); border-radius:10px; color:#e8eaf0; font-size:14px; outline:none; font-family:var(--font-ui); }
        .fn-login-card input:focus { border-color:var(--accent-blue); box-shadow:0 0 0 2px rgba(77,143,255,0.2); }
        .fn-login-card .btn { width:100%; padding:12px; background:var(--accent-blue); color:white; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:var(--font-ui); margin-top:4px; }
        .fn-login-card .btn:hover { background:#5f9fff; }
        .fn-login-card .hint { text-align:center; font-size:11px; color:var(--text-muted); margin-top:12px; }
        .fn-login-card .err { background:rgba(231,76,60,0.12); border:1px solid rgba(231,76,60,0.3); color:#e74c3c; padding:8px; border-radius:8px; font-size:12px; margin-bottom:8px; }
        /* Selected sensor header */
        .fn-selected-header { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:10px; }
        .fn-selected-header .name { font-weight:700; font-size:14px; }
        .fn-selected-header .zone { font-size:11px; color:var(--text-muted); }
        .fn-status-badge { display:inline-block; padding:3px 10px; border-radius:10px; font-size:11px; font-weight:600; }
      `}</style>

      {/* CSS for Leaflet */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {!authenticated ? (
        <div className="fn-login-screen">
          <form className="fn-login-card" onSubmit={handleLogin}>
            <div style={{textAlign:"center",fontSize:48,marginBottom:4}}>🔥</div>
            <h1>Floranet</h1>
            <p className="sub">Surveillance Incendies Forestiers</p>
            {loginErr && <div className="err">{loginErr}</div>}
            <label><span>Nom d'utilisateur</span><input value={username} onChange={(e)=>setUsername(e.target.value)} autoFocus /></label>
            <label><span>Mot de passe</span><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
            <button type="submit" className="btn">Se connecter</button>
            <p className="hint">Simulation — entrez n'importe quel identifiant</p>
          </form>
        </div>
      ) : (
        <div className="fn-wrap">
          {/* Header */}
          <header className="fn-header">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>🔥</span>
              <h1>Floranet — Surveillance Incendies</h1>
            </div>
            <div className="fn-header-info">
              <div className="fn-live"><div className="fn-live-dot" /><span style={{fontSize:12,fontWeight:600,color:"var(--green)"}}>LIVE</span></div>
              <div className="fn-badge"><span style={{fontSize:11,color:"var(--text-muted)"}}>Mise à jour</span><span className="time">{lastUpdate || "--:--:--"}</span></div>
              <div className="fn-badge">{gatewayActive ? "📡 Passerelle active" : "📡 ..."}</div>
              <span className="fn-scenario" style={{
                background: scenario === "alert" ? "rgba(231,76,60,0.15)" : scenario === "warning" ? "rgba(240,180,41,0.15)" : "rgba(46,204,113,0.15)",
                color: STATUS_COLORS[scenario] || "#2ecc71",
                border: `1px solid ${(STATUS_COLORS[scenario] || "#2ecc71")}40`,
              }}>Scénario: {scenario}</span>
              <button onClick={()=>setAuthenticated(false)} style={{background:"none",border:"1px solid var(--border)",color:"var(--text-muted)",padding:"5px 12px",borderRadius:20,fontSize:14,cursor:"pointer",fontFamily:"var(--font-ui)"}}>⏻</button>
            </div>
          </header>

          {/* Alert banner */}
          {alertEntry && (
            <div className="fn-alert-banner">
              <span>🔥 <strong>ALERTE INCENDIE</strong> — {alertEntry[1].name} ({alertEntry[1].zone}) — T: {alertEntry[1].temperature}°C | Risque IA: {(alertEntry[1].risk*100).toFixed(1)}%</span>
              <button onClick={() => setSelectedId(alertEntry[0])}>Voir détails</button>
            </div>
          )}

          {/* Dashboard */}
          <div className="fn-dash">
            {/* Left sidebar — sensor list */}
            <div className="fn-sidebar-l">
              <h3>Réseau LoRa — {Object.keys(sensors).length} nœuds</h3>
              {Object.entries(sensors).map(([id, s]) => (
                <div
                  key={id}
                  className={`fn-sensor-item s-${s.status} ${selectedId === id ? "selected" : ""}`}
                  onClick={() => setSelectedId(id)}
                >
                  <div className="fn-sensor-name">{s.name}</div>
                  <div className="fn-sensor-info">
                    <span style={{color:"var(--text-muted)"}}>Zone : {s.zone}</span>
                    <span style={{fontSize:10}}>{STATUS_LABELS[s.status]?.split(" ")[0]} {s.status === "normal" ? "Connecté" : s.status === "warning" ? "Connecté" : s.status === "alert" ? "Connecté" : "..."}</span>
                  </div>
                  <div className="fn-sensor-info">
                    <span>🌡️ {s.temperature != null ? `${s.temperature}°C` : "--"}</span>
                    <span>💧 {s.humidity != null ? `${s.humidity}%` : "--"}</span>
                  </div>
                  <div className="fn-sensor-info">
                    {s.smoke_level != null ? <span>💨 {s.smoke_level}/4095{s.smoke_trigger ? " 🔥" : ""}</span> : <span>🔋 {s.battery_level ?? "--"}%</span>}
                    <span style={{fontSize:10}}>{s.rssi != null ? `${s.rssi} dBm` : "--"}</span>
                  </div>
                  {s.smoke_level != null && <div className="fn-sensor-info"><span>🔋 {s.battery_level ?? "--"}%</span></div>}
                  <div className="fn-sensor-info" style={{marginTop:4}}>
                    <span style={{color:"var(--text-muted)",fontSize:10}}>{s.last_seen ? `🕐 ${new Date(s.last_seen).toLocaleTimeString("fr-CA")}` : ""}</span>
                    <span className={`fn-risk-badge fn-risk-${s.status === "alert" ? "alert" : s.risk >= 0.3 ? "warning" : "normal"}`}>
                      Risque : {(s.risk * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="fn-map">
              <MapContainer center={MAP_CENTER} zoom={17} style={{width:"100%",height:"100%"}} zoomControl>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19}
                  attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>' />
                <Marker position={GATEWAY_POS} icon={gatewayIcon}>
                  <Popup>📡 Passerelle LoRa</Popup>
                </Marker>
                {Object.entries(sensors).map(([id, s]) => (
                  <Marker key={id} position={[s.latitude, s.longitude]} icon={sensorIcon(s.status)}
                    eventHandlers={{ click: () => setSelectedId(id) }}>
                    <Popup>
                      <div style={{fontFamily:"Inter,sans-serif",fontSize:12}}>
                        <strong>{s.name}</strong> ({s.zone})<br/>
                        🌡️ {s.temperature}°C | 💧 {s.humidity}%<br/>
                        Risque IA : <strong style={{color:STATUS_COLORS[s.status]}}>{(s.risk*100).toFixed(1)}%</strong>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <MapPan selectedId={selectedId} sensors={sensors} />
                <MapFixer />
              </MapContainer>
            </div>

            {/* Right sidebar — details */}
            <div className="fn-sidebar-r">
              {/* Selected sensor */}
              {selected ? (
                <>
                  <div className="fn-selected-header">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div className="name">{selected.name}</div>
                        <div className="zone">{selected.zone} · {selectedId}</div>
                      </div>
                      <span className="fn-status-badge" style={{
                        background: `${STATUS_COLORS[selected.status]}18`,
                        color: STATUS_COLORS[selected.status],
                        border: `1px solid ${STATUS_COLORS[selected.status]}40`,
                      }}>{STATUS_LABELS[selected.status]}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  {[
                    { icon: "🔋", title: "Batterie", val: `${selected.battery_level ?? "--"}%`, pct: selected.battery_level ?? 0, color: (selected.battery_level ?? 100) <= 20 ? "var(--red)" : "var(--green)", hint: "LiPo 3.7V 2000mAh · Alerte ≤ 20%" },
                    { icon: "🌡️", title: "Température", val: `${selected.temperature ?? "--"}°C`, pct: Math.min(100, ((selected.temperature ?? 0) / 80) * 100), color: "var(--temp-color)", hint: "BME280 · Vigilance ≥ 40°C · Alerte ≥ 50°C" },
                    { icon: "💧", title: "Humidité", val: `${selected.humidity ?? "--"}%`, pct: selected.humidity ?? 0, color: "var(--hum-color)", hint: "BME280 · Vigilance ≤ 18% · Alerte ≤ 10%" },
                    ...(selected.smoke_level != null ? [{ icon: "💨", title: "Fumée (MQ-2)", val: `${selected.smoke_level}`, pct: Math.min(100, (selected.smoke_level / 4095) * 100), color: "var(--smoke-color)", hint: "ADC 12-bit (0-4095) · Vigilance ≥ 300 · Alerte ≥ 700" }] : []),
                    { icon: "🤖", title: "Risque IA (LSTM)", val: `${(selected.risk * 100).toFixed(1)}%`, pct: selected.risk * 100, color: "var(--ai-color)", hint: "LSTM 3×128 · 334K params · fenêtre 30×7" },
                  ].map((m) => (
                    <div className="fn-metric" key={m.title}>
                      <div className="fn-metric-head">
                        <span className="fn-metric-title">{m.icon} {m.title}</span>
                      </div>
                      <div className="fn-metric-val" style={{color: m.color}}>{m.val}</div>
                      <div className="fn-metric-bar"><div className="fn-metric-fill" style={{width:`${m.pct}%`, background: m.color}} /></div>
                      <div className="fn-metric-hint">{m.hint}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{textAlign:"center",padding:20,color:"var(--text-muted)",fontSize:13}}>
                  Cliquez sur un capteur pour voir ses détails
                </div>
              )}

              {/* Summary */}
              <div className="fn-summary" style={{marginTop:12}}>
                <h4>Réseau</h4>
                <div className="fn-summary-grid">
                  {[
                    {label:"Normal",count:counts.normal,color:"var(--green)",bg:"rgba(46,204,113,0.08)"},
                    {label:"Vigilance",count:counts.warning,color:"var(--yellow)",bg:"rgba(240,180,41,0.08)"},
                    {label:"Alerte",count:counts.alert,color:"var(--red)",bg:"rgba(231,76,60,0.08)"},
                    {label:"Déconnecté",count:counts.disconnected,color:"var(--grey)",bg:"rgba(107,120,150,0.08)"},
                  ].map(s => (
                    <div className="fn-summary-item" key={s.label} style={{background:s.bg}}>
                      <div className="count" style={{color:s.color}}>{s.count}</div>
                      <div className="label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
