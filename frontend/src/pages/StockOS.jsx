import { useState, useEffect } from "react";
import api from "../api";

/* ── Original Inventaire design: dark navy (#0f172a), #111827 cards, blue primary, red danger ── */

const EMPTY = { id: null, name: "", description: "", product_type: "", quantity: 0, min_threshold: 0 };

export default function StockOS() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [tab, setTab] = useState("inventory");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const url = tab === "inventory" ? "/products" : "/products/shopping";
      setItems((await api.get(url)).data);
    } catch { setError("Impossible de charger les données"); setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [tab]);

  async function save() {
    if (!form.name) return; setError("");
    try {
      const payload = { ...form, quantity: Number(form.quantity), min_threshold: Number(form.min_threshold) };
      if (form.id) await api.put(`/products/${form.id}`, payload);
      else await api.post("/products", payload);
      setForm({ ...EMPTY }); load();
    } catch (err) { setError(err.response?.data?.error || "Échec de sauvegarde"); }
  }

  async function del(id) {
    try { await api.delete(`/products/${id}`); load(); } catch { setError("Échec de suppression"); }
  }

  return (
    <>
      <style>{`
        .inv-wrap {
          --bg: #0f172a; --card: #111827; --text: #e5e7eb; --muted: #9ca3af;
          --primary: #2563eb; --danger: #dc2626; --border: #1f2937;
          min-height: calc(100vh - 200px); background: var(--bg); color: var(--text);
          margin: -16px; padding: 24px 16px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }
        .inv-container { max-width: 920px; margin: 0 auto; }
        .inv-container h1 { margin: 0 0 12px; font-weight: 700; }
        .inv-container h2.section-title { margin: 16px 0 8px; font-weight: 600; }
        .inv-tabs { display: flex; gap: 8px; margin: 12px 0 20px; }
        .inv-tab {
          padding: 8px 12px; background: transparent; color: var(--text);
          border: 1px solid var(--border); border-radius: 10px; cursor: pointer;
          font-family: inherit; font-size: 14px;
        }
        .inv-tab.active { background: var(--card); }
        .inv-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
        .inv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .inv-grid .full { grid-column: 1 / span 2; }
        .inv-card label span { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
        .inv-card input, .inv-card textarea {
          width: 100%; padding: 10px; border-radius: 10px;
          border: 1px solid var(--border); background: #0b1220; color: var(--text);
          font-family: inherit; font-size: 14px; outline: none;
        }
        .inv-card textarea { min-height: 72px; resize: vertical; }
        .inv-actions { margin-top: 10px; display: flex; gap: 8px; }
        .inv-btn {
          padding: 8px 12px; border-radius: 10px; background: #0b1220;
          border: 1px solid var(--border); color: var(--text); cursor: pointer;
          font-family: inherit; font-size: 14px;
        }
        .inv-btn.primary { background: var(--primary); border-color: var(--primary); color: white; }
        .inv-btn.danger { background: var(--danger); border-color: var(--danger); color: white; }
        .inv-list { list-style: none; padding: 0; margin: 8px 0 0; }
        .inv-list-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid var(--border); gap: 12px;
        }
        .inv-list-item:last-child { border-bottom: none; }
        .item-info { font-size: 14px; }
        .item-actions { display: flex; gap: 8px; }
        .inv-alert {
          margin: 8px 0; color: #fecaca; background: #7f1d1d;
          border: 1px solid #dc2626; padding: 8px 12px; border-radius: 10px;
        }
        .inv-tag {
          display: inline-block; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
          color: var(--primary); border: 1px solid rgba(37,99,235,0.2);
          background: rgba(37,99,235,0.05); padding: 4px 12px; border-radius: 99px; margin-bottom: 12px;
        }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 640px) {
          .inv-wrap { padding: 16px 12px; }
          .inv-container h1 { font-size: 22px; }
          /* Form : passer en 1 colonne sur mobile */
          .inv-grid { grid-template-columns: 1fr; }
          .inv-grid .full { grid-column: 1; }
          /* Liste : empiler info + actions verticalement */
          .inv-list-item {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .item-actions {
            justify-content: flex-end;
          }
          .item-actions .inv-btn { flex: 0 0 auto; }
        }
        @media (max-width: 380px) {
          /* Onglets en pleine largeur partagée */
          .inv-tabs { gap: 6px; }
          .inv-tab { flex: 1; padding: 8px 6px; font-size: 13px; text-align: center; }
        }
      `}</style>

      <div className="inv-wrap">
        <div className="inv-container">
          <div className="inv-tag">Projet : Inventaire · Django REST Framework</div>
          <h1>📦 Gestion d'inventaire</h1>

          <div className="inv-tabs">
            <button className={`inv-tab ${tab === "inventory" ? "active" : ""}`} onClick={() => { setTab("inventory"); setForm({...EMPTY}); }}>Inventaire</button>
            <button className={`inv-tab ${tab === "shopping" ? "active" : ""}`} onClick={() => { setTab("shopping"); setForm({...EMPTY}); }}>Liste d'achat</button>
          </div>

          {tab === "inventory" && (
            <div className="inv-card" style={{marginBottom:16}}>
              <h2 style={{margin:"0 0 12px", fontWeight:600}}>{form.id ? "Modifier un produit" : "Ajouter un produit"}</h2>
              <div className="inv-grid">
                <label><span>Nom</span><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></label>
                <label><span>Type</span><input value={form.product_type} onChange={(e) => setForm({...form, product_type: e.target.value})} /></label>
                <label><span>Quantité</span><input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} /></label>
                <label><span>Seuil min</span><input type="number" value={form.min_threshold} onChange={(e) => setForm({...form, min_threshold: e.target.value})} /></label>
                <label className="full"><span>Description</span><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></label>
              </div>
              <div className="inv-actions">
                <button className="inv-btn primary" onClick={save}>{form.id ? "Enregistrer" : "Ajouter"}</button>
                {form.id && <button className="inv-btn" onClick={() => setForm({...EMPTY})}>Annuler</button>}
              </div>
            </div>
          )}

          <h2 className="section-title">{tab === "inventory" ? "Produits" : "À acheter (quantité < seuil)"}</h2>

          {error && <div className="inv-alert">{error}</div>}

          {loading ? <p>Chargement…</p> : items.length === 0 ? <p>Aucun élément.</p> : (
            <ul className="inv-list">
              {items.map((it) => (
                <li key={it.id} className="inv-list-item">
                  <div className="item-info">
                    <strong>{it.name}</strong> — {it.product_type} — Qté: {it.quantity} — Seuil: {it.min_threshold}
                    {it.description && <> — <em>{it.description}</em></>}
                  </div>
                  {tab === "inventory" && (
                    <div className="item-actions">
                      <button className="inv-btn" onClick={() => setForm(it)}>Éditer</button>
                      <button className="inv-btn danger" onClick={() => del(it.id)}>Supprimer</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
