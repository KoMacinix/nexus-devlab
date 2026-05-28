import { useState, useEffect } from "react";
import api from "../api";

/* ── GeoIntel design: light theme, vraie carte du monde en fond (motif de points), wrapper plein écran SOUS la navbar nexus (comme Tookah / FloraNet / Tutti Frutti) ── */

export default function GeoIntel() {
  const [token, setToken] = useState(localStorage.getItem("nexus_token"));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("nexus_user")); } catch { return null; } });
  const [email, setEmail] = useState("demo@nexus.dev");
  const [password, setPassword] = useState("123456");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState("Canada");
  const [result, setResult] = useState(null);
  const [rawXml, setRawXml] = useState("");
  const [showXml, setShowXml] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { api.get("/countries/list").then((r) => setCountries(r.data)).catch(() => {}); }, []);

  async function handleLogin(e) {
    e.preventDefault(); setLoginErr(""); setLoginLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("nexus_token", res.data.token);
      localStorage.setItem("nexus_user", JSON.stringify(res.data.user));
      setToken(res.data.token); setUser(res.data.user);
    } catch (err) { setLoginErr(err.response?.data?.error || "Erreur de connexion"); }
    finally { setLoginLoading(false); }
  }

  function handleLogout() { localStorage.removeItem("nexus_token"); localStorage.removeItem("nexus_user"); setToken(null); setUser(null); setResult(null); }

  async function handleSearch() {
    setSearchErr(""); setResult(null); setRawXml(""); setSearchLoading(true);
    try {
      const res = await api.post("/countries/soap", { pays: selected });
      setResult(res.data.country); setRawXml(res.data.rawXml || "");
    } catch (err) { setSearchErr(err.response?.data?.error || "Erreur SOAP"); }
    finally { setSearchLoading(false); }
  }

  return (
    <>
      <style>{`
        /* ── Wrapper plein écran SOUS la navbar nexus (sticky h-14 = 56px),
           même pattern que .tf-page-host (Tutti Frutti) et .tookah-page-host (Tookah). ── */
        .geo-page-host {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 30;
          overflow-y: auto;
          overflow-x: hidden;
          background: #e8efe8;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-overflow-scrolling: touch;
        }
        /* Carte du monde en fond (vraie carte SVG en motif de points) */
        .geo-map-bg {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: url('/geointel/world-map.svg') no-repeat center center;
          background-size: cover;
          opacity: 0.18;
        }
        .geo-wrap {
          min-height: 100%;
          color: #222;
          padding: 48px 16px;
          display: flex; justify-content: center;
          position: relative;
        }
        .geo-inner { width: 100%; max-width: 600px; position: relative; z-index: 1; }
        .geo-card {
          background: rgba(255,255,255,0.92); border-radius: 10px; padding: 28px 32px;
          box-shadow: 0 10px 30px rgba(15,23,42,0.12);
          backdrop-filter: blur(6px);
        }
        .geo-card h2 { margin: 0 0 12px; font-weight: 700; color: #222; }
        .geo-card p { margin: 4px 0; }
        .geo-field { margin-bottom: 12px; }
        .geo-field label { display: block; font-size: 14px; margin-bottom: 4px; color: #444; }
        .geo-field input, .geo-field select {
          width: 100%; max-width: 320px; padding: 8px 10px; border-radius: 6px;
          border: 1px solid #cbd5e1; font-size: 15px; outline: none; font-family: inherit;
        }
        .geo-field input:focus, .geo-field select:focus { border-color: #2563eb; box-shadow: 0 0 0 1px rgba(37,99,235,0.2); }
        .geo-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 16px; border-radius: 6px; border: 1px solid transparent;
          font-size: 15px; cursor: pointer; transition: background 0.15s, transform 0.1s;
          font-family: inherit;
        }
        .geo-btn-primary { background: #2563eb; color: #fff; border-color: #2563eb; }
        .geo-btn-primary:hover { background: #1d4ed8; }
        .geo-btn-primary:disabled { opacity: 0.5; cursor: default; }
        .geo-btn-outline { background: #fff; color: #0f172a; border-color: #cbd5e1; }
        .geo-btn-outline:hover { background: #f8fafc; }
        .geo-big-btn {
          display: flex; justify-content: center; align-items: center;
          width: 100%; max-width: 320px; padding: 12px 16px; text-align: center;
          font-size: 16px; border-radius: 8px; font-weight: 500; margin: 0 auto;
        }
        .geo-error { color: #b91c1c; font-size: 14px; margin-top: 8px; }
        .geo-result {
          margin-top: 16px; padding: 14px 16px; border-radius: 8px;
          background: #f1f5f9; border: 1px solid #e2e8f0;
        }
        .geo-result p { margin: 4px 0; font-size: 14px; }
        .geo-xml {
          margin-top: 12px; padding: 12px; border-radius: 8px;
          background: #0f172a; color: #94a3b8; font-size: 11px;
          font-family: monospace; white-space: pre-wrap; overflow-x: auto;
        }
        .geo-tag {
          display: inline-block; font-size: 10px; letter-spacing: 1px;
          text-transform: uppercase; color: #2563eb; border: 1px solid #2563eb30;
          background: #2563eb08; padding: 4px 12px; border-radius: 99px; margin-bottom: 16px;
        }
        @media (max-width: 640px) {
          .geo-wrap { padding: 24px 12px; }
          .geo-card { padding: 20px 18px; }
        }
      `}</style>

      <div className="geo-page-host">
        <div className="geo-map-bg" />
        <div className="geo-wrap">
          <div className="geo-inner">
            <div style={{textAlign:"center", marginBottom: 24}}>
              <div className="geo-tag">Projet : Pays · SOAP · Spring Boot</div>
              <h1 style={{margin:"0 0 4px", fontSize:28, fontWeight:700, color:"#222", display:"flex", alignItems:"center", justifyContent:"center", gap:10}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15 15 0 0 1 0 20"/>
                  <path d="M12 2a15 15 0 0 0 0 20"/>
                </svg>
                GeoIntel
              </h1>
              <p style={{color:"#64748b", fontSize:14}}>Client SOAP — Authentification JWT — Parsing XML</p>
            </div>

            {!token ? (
              <div className="geo-card">
                <h2>Connexion</h2>
                <p style={{fontSize:14, color:"#64748b", marginBottom:12}}>
                  Utilise ton courriel de démo et le mot de passe indiqué pour accéder au formulaire.
                </p>
                <form onSubmit={handleLogin}>
                  <div className="geo-field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  </div>
                  <div className="geo-field">
                    <label>Mot de passe</label>
                    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
                  </div>
                  {loginErr && <p className="geo-error">{loginErr}</p>}
                  <button type="submit" className="geo-btn geo-btn-primary geo-big-btn" disabled={loginLoading}>
                    {loginLoading ? "Connexion..." : "Se connecter"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="geo-card">
                <h2>Recherche d'information sur un pays</h2>
                <p>Connecté en tant que : <strong>{user?.email}</strong></p>
                <button onClick={handleLogout} className="geo-btn geo-btn-outline" style={{marginBottom:16}}>Se déconnecter</button>

                <div className="geo-field">
                  <label>Nom du pays (Spain, Poland, United Kingdom)</label>
                  <select value={selected} onChange={(e)=>setSelected(e.target.value)} style={{maxWidth:"100%"}}>
                    {countries.map((c)=><option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <button className="geo-btn geo-btn-primary" onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? "Requête en cours..." : "Rechercher"}
                </button>

                {searchErr && <p className="geo-error">Erreur : {searchErr}</p>}

                {result && (
                  <div className="geo-result">
                    <h3 style={{margin:"0 0 8px", fontSize:16}}>Résultat (JSON)</h3>
                    <p><strong>Pays :</strong> {result.name}</p>
                    <p><strong>Capitale :</strong> {result.capital}</p>
                    <p><strong>Population :</strong> {result.population.toLocaleString("fr")}</p>
                    <p><strong>Devise :</strong> {result.currency}</p>
                  </div>
                )}

                {rawXml && (
                  <div style={{marginTop:12}}>
                    <button onClick={()=>setShowXml(!showXml)} className="geo-btn geo-btn-outline" style={{fontSize:13}}>
                      {showXml ? "Masquer" : "Voir"} le XML SOAP brut
                    </button>
                    {showXml && <pre className="geo-xml">{rawXml}</pre>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
