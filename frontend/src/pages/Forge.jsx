import { useState, useEffect } from "react";
import api from "../api";

/* ── Tutti Frutti design: animated fruits, dark navbar blur, gradient login, rounded cards, table striped ── */

const EMPTY = { id: null, name: "", description: "", price: "" };

const FRUITS = ["🍎", "🍌", "🍒", "🍍", "🍓", "🍊", "🥝", "🍇", "🍑", "🍋", "🫐", "🍉"];

function FruitBackground() {
  const items = Array.from({ length: 18 }, (_, i) => ({
    fruit: FRUITS[i % FRUITS.length],
    left: Math.random() * 95,
    duration: 8 + Math.random() * 12,
    size: 24 + Math.random() * 30,
    delay: Math.random() * 10,
  }));
  return (
    <div className="fruit-bg">
      {items.map((f, i) => (
        <span key={i} className="floating-fruit" style={{
          left: `${f.left}%`, fontSize: `${f.size}px`,
          animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s`,
        }}>{f.fruit}</span>
      ))}
    </div>
  );
}

export default function Forge() {
  const [forgeToken, setForgeToken] = useState(null);
  const [forgeUser, setForgeUser] = useState(null);
  const [page, setPage] = useState("login"); // login | register | products
  const [email, setEmail] = useState("demo@nexus.dev");
  const [password, setPassword] = useState("123456");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);
  // Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErr, setRegErr] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  // Products
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [valErrors, setValErrors] = useState({});

  async function loadProducts() { try { setProducts((await api.get("/store/products")).data); } catch {} }
  useEffect(() => { loadProducts(); }, []);

  async function handleLogin(e) {
    e.preventDefault(); setLoginErr(""); setLoginLoading(true); setAttemptsLeft(null);
    try {
      const res = await api.post("/store/login-encrypted", {
        user: email,
        pass: JSON.stringify({ ct: btoa(JSON.stringify(password)), iv: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,"0")).join(""), s: Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2,"0")).join("") }),
      });
      setForgeToken(res.data.token); setForgeUser(res.data.user); setPage("products");
    } catch (err) {
      const d = err.response?.data; setLoginErr(d?.error || "Erreur");
      if (d?.attemptsLeft != null) setAttemptsLeft(d.attemptsLeft);
      if (d?.locked) setLockedUntil(d.lockedUntil);
    } finally { setLoginLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); setRegErr(""); setRegSuccess(""); setRegLoading(true);
    if (regPass !== regConfirm) { setRegErr("Les mots de passe ne correspondent pas."); setRegLoading(false); return; }
    if (!regName || !regEmail || !regPass) { setRegErr("Tous les champs sont requis."); setRegLoading(false); return; }
    try {
      await api.post("/auth/register", { name: regName, email: regEmail, password: regPass });
      setRegSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setRegName(""); setRegEmail(""); setRegPass(""); setRegConfirm("");
      setTimeout(() => { setPage("login"); setRegSuccess(""); }, 2000);
    } catch (err) {
      setRegErr(err.response?.data?.error || "Erreur lors de la création du compte.");
    } finally { setRegLoading(false); }
  }

  function logout() { setForgeToken(null); setForgeUser(null); setPage("login"); }

  async function save(e) {
    e.preventDefault(); setValErrors({}); setError("");
    try {
      const p = { name: form.name, description: form.description, price: Number(form.price) };
      if (form.id) await api.put(`/store/products/${form.id}`, p);
      else await api.post("/store/products", p);
      setForm({ ...EMPTY }); setShowForm(false); loadProducts();
    } catch (err) {
      if (err.response?.status === 422) setValErrors(err.response.data.errors || {});
      else setError("Erreur de sauvegarde");
    }
  }

  async function del(id) { try { await api.delete(`/store/products/${id}`); loadProducts(); } catch {} }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600&display=swap');
        .forge-wrap { margin: -16px; min-height: calc(100vh - 200px); font-family: 'Segoe UI', sans-serif; position: relative; }

        /* Animated fruit background */
        .fruit-bg { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .floating-fruit {
          position: absolute; bottom: -60px;
          animation: floatUp linear infinite;
          opacity: 0.35;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        /* Black transparent navbar with blur */
        .forge-nav {
          background: rgba(0,0,0,0.7); padding: 12px 24px; color: white;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          position: relative; z-index: 10;
        }
        .forge-nav .brand { font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 8px; }
        .forge-nav .nav-links { display: flex; gap: 16px; font-size: 14px; align-items: center; }
        .forge-nav a, .forge-nav span { color: white; text-decoration: none; cursor: pointer; }
        .forge-nav a:hover, .forge-nav span:hover { color: #ffc107; }
        .forge-nav .badge-logged { color: #ffc107; }

        /* Login page - gradient like original */
        .forge-login-bg {
          background: linear-gradient(135deg, #dfefff, #f6f9fc);
          min-height: calc(100vh - 250px); display: flex; align-items: center; justify-content: center;
          padding: 32px 16px; position: relative; z-index: 1;
        }
        .forge-login-card {
          max-width: 400px; width: 100%; border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1); background: white; padding: 24px; color: #333;
        }
        .forge-login-card h4 { text-align: center; margin: 0 0 16px; }
        .forge-login-card .form-label { font-size: 14px; color: #555; display: block; margin-bottom: 4px; }
        .forge-login-card input {
          width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 8px;
          font-size: 14px; margin-bottom: 12px; outline: none; font-family: inherit;
        }
        .forge-login-card input:focus { border-color: #86b7fe; box-shadow: 0 0 0 3px rgba(13,110,253,0.25); }
        .forge-login-card .btn-primary {
          width: 100%; padding: 10px; background: #0d6efd; color: white; border: none;
          border-radius: 8px; font-size: 15px; cursor: pointer; font-family: inherit;
        }
        .forge-login-card .btn-primary:hover { background: #0b5ed7; }
        .forge-login-card .alert-danger {
          background: #f8d7da; border: 1px solid #f5c2c7; color: #842029;
          padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 13px;
        }
        .forge-login-card .alert-success {
          background: #d1e7dd; border: 1px solid #badbcc; color: #0f5132;
          padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 13px;
        }
        .forge-login-card .switch-link {
          text-align: center; margin-top: 14px; font-size: 13px; color: #666;
        }
        .forge-login-card .switch-link a {
          color: #0d6efd; cursor: pointer; text-decoration: underline;
        }

        /* Main content area */
        .forge-content { background: #f8f9fa; padding: 24px 16px; min-height: calc(100vh - 250px); color: #333; position: relative; z-index: 1; }
        .forge-content .container { max-width: 900px; margin: 0 auto; }
        .forge-content .card { background: white; border-radius: 15px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #dee2e6; }
        .forge-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .forge-table thead th { background: #212529; color: white; padding: 10px 12px; text-align: left; }
        .forge-table tbody tr:nth-child(even) { background: #f8f9fa; }
        .forge-table tbody tr:hover { background: #e2e6ea; }
        .forge-table td { padding: 10px 12px; border-bottom: 1px solid #dee2e6; }
        .btn-sm { padding: 4px 10px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; margin-right: 4px; }
        .btn-warning { background: #ffc107; color: #000; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-success { background: #198754; color: white; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; }
        .btn-success:hover { background: #157347; }
        .forge-form label { display: block; font-size: 14px; margin-bottom: 4px; color: #555; }
        .forge-form input, .forge-form textarea {
          width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 8px;
          font-size: 14px; margin-bottom: 12px; outline: none; font-family: inherit;
        }
      `}</style>

      <div className="forge-wrap">
        <FruitBackground />

        {/* Black transparent navbar with blur */}
        <div className="forge-nav">
          <span className="brand">🍊 Tutti Frutti</span>
          <div className="nav-links">
            {forgeToken && <span onClick={() => { setShowForm(false); }}>Produits</span>}
            {forgeToken ? (
              <>
                <span className="badge-logged">✓ Connecté</span>
                <span onClick={logout}>Déconnexion</span>
              </>
            ) : (
              <>
                <span onClick={() => setPage("login")}>Connexion</span>
                <span onClick={() => setPage("register")}>Créer un compte</span>
              </>
            )}
          </div>
        </div>

        {/* Login */}
        {!forgeToken && page === "login" && (
          <div className="forge-login-bg">
            <div className="forge-login-card">
              <h4>🔒 Connexion sécurisée</h4>
              {lockedUntil && new Date(lockedUntil) > new Date() && (
                <div className="alert-danger">🔒 Compte bloqué jusqu'à {new Date(lockedUntil).toLocaleTimeString("fr")}</div>
              )}
              {loginErr && (
                <div className="alert-danger">
                  ⚠ {loginErr} {attemptsLeft != null && `(${attemptsLeft} tentative(s) restante(s))`}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <label className="form-label">Email :</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Entrez votre email" />
                <label className="form-label">Mot de passe :</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Entrez votre mot de passe" />
                <button type="submit" className="btn-primary" disabled={loginLoading}>
                  {loginLoading ? "Vérification..." : "Se connecter"}
                </button>
              </form>
              <div className="switch-link">
                Pas de compte ? <a onClick={() => setPage("register")}>Créer un compte</a>
              </div>
              <p style={{fontSize:11, color:"#888", textAlign:"center", marginTop:12}}>Démo : demo@nexus.dev / 123456 · 3 échecs = verrouillage</p>
            </div>
          </div>
        )}

        {/* Register */}
        {!forgeToken && page === "register" && (
          <div className="forge-login-bg">
            <div className="forge-login-card">
              <h4>👤 Créer un compte</h4>
              {regErr && <div className="alert-danger">⚠ {regErr}</div>}
              {regSuccess && <div className="alert-success">✓ {regSuccess}</div>}
              <form onSubmit={handleRegister}>
                <label className="form-label">Nom :</label>
                <input type="text" value={regName} onChange={(e)=>setRegName(e.target.value)} placeholder="Votre nom" />
                <label className="form-label">Email :</label>
                <input type="email" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} placeholder="Votre email" />
                <label className="form-label">Mot de passe :</label>
                <input type="password" value={regPass} onChange={(e)=>setRegPass(e.target.value)} placeholder="Choisir un mot de passe" />
                <label className="form-label">Confirmation :</label>
                <input type="password" value={regConfirm} onChange={(e)=>setRegConfirm(e.target.value)} placeholder="Confirmer le mot de passe" />
                <button type="submit" className="btn-primary" disabled={regLoading}>
                  {regLoading ? "Création..." : "Créer un compte"}
                </button>
              </form>
              <div className="switch-link">
                Déjà un compte ? <a onClick={() => setPage("login")}>Se connecter</a>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {forgeToken && (
          <div className="forge-content">
            <div className="container">
              {showForm ? (
                <div className="card" style={{marginBottom:16}}>
                  <h2 style={{margin:"0 0 16px"}}>{form.id ? "✏️ Modifier" : "➕ Ajouter"} un Produit</h2>
                  {Object.entries(valErrors).map(([k,v]) => (
                    <div key={k} style={{background:"#f8d7da",border:"1px solid #f5c2c7",color:"#842029",padding:"6px 12px",borderRadius:8,marginBottom:8,fontSize:13}}>⚠ {v}</div>
                  ))}
                  <form className="forge-form" onSubmit={save}>
                    <label>Nom du produit</label>
                    <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Ex. : Chocolat Noir" />
                    <label>Description</label>
                    <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} rows={3} placeholder="Décrivez le produit..." />
                    <label>Prix ($)</label>
                    <input type="number" step="0.01" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} placeholder="Ex. : 1.99" />
                    <div style={{display:"flex",gap:8}}>
                      <button type="submit" className="btn-success">✓ Enregistrer</button>
                      <button type="button" className="btn-sm" style={{background:"#6c757d",color:"white",padding:"8px 16px",borderRadius:8}} onClick={()=>{setShowForm(false);setForm({...EMPTY});}}>Annuler</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card">
                  <h3 style={{margin:"0 0 16px"}}>Catalogue des Produits</h3>
                  <button className="btn-success" style={{marginBottom:16}} onClick={()=>setShowForm(true)}>➕ Ajouter un produit</button>
                  <table className="forge-table">
                    <thead><tr><th>Nom</th><th>Description</th><th>Prix</th><th>Actions</th></tr></thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={4} style={{textAlign:"center"}}>Aucun produit disponible.</td></tr>
                      ) : products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.description}</td>
                          <td>{Number(p.price).toFixed(2)} $/LB</td>
                          <td>
                            <button className="btn-sm btn-warning" onClick={()=>{setForm(p);setShowForm(true);}}>✎</button>
                            <button className="btn-sm btn-danger" onClick={()=>del(p.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
