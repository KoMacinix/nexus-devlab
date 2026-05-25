import { useState, useEffect } from "react";
import api from "../api";

/* ── Original TicketConcert design: concert bg, blue gradient navbar, dark glass containers ── */

const TICKET_TYPES = [
  { name: "Standard", price: 49.99, emoji: "🎵", btnClass: "sp-btn-blue", desc: "Accès général à l'événement." },
  { name: "VIP", price: 149.99, emoji: "⭐", btnClass: "sp-btn-yellow", desc: "Accès et services exclusifs." },
  { name: "Premium", price: 249.99, emoji: "👑", btnClass: "sp-btn-red", desc: "Meilleures places et accès en coulisses." },
];

const EMPTY_CLIENT = { nom: "", prenom: "", telephone: "", dateNaissance: "", adresse: "" };
const EMPTY_CMD = { typeBillet: "Standard", nombreBillets: 1 };

export default function ShowPass() {
  const [step, setStep] = useState("select");
  const [client, setClient] = useState({ ...EMPTY_CLIENT });
  const [commande, setCommande] = useState({ ...EMPTY_CMD });
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [allCommandes, setAllCommandes] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadCommandes() { try { setAllCommandes((await api.get("/tickets/commandes")).data); } catch {} }
  useEffect(() => { loadCommandes(); }, []);

  function selectType(type) { setCommande({ ...commande, typeBillet: type }); setStep("form"); setErrors({}); }

  async function handleSubmit(e) {
    e.preventDefault(); setErrors({}); setSubmitting(true);
    try {
      const res = await api.post("/tickets/commande", { client, commande: { ...commande, nombreBillets: Number(commande.nombreBillets) } });
      setConfirmation(res.data); setStep("confirmation"); loadCommandes();
    } catch (err) { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); }
    finally { setSubmitting(false); }
  }

  function reset() { setClient({...EMPTY_CLIENT}); setCommande({...EMPTY_CMD}); setErrors({}); setConfirmation(null); setStep("select"); }

  return (
    <>
      <style>{`
        .sp-wrap {
          margin: -16px; min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #0a1628 0%, #1a2740 50%, #0d1b2a 100%);
          font-family: system-ui, -apple-system, sans-serif; color: white;
        }
        .sp-nav {
          background: linear-gradient(to right, rgba(0,74,173,0.85), rgba(30,60,114,0.85));
          padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .sp-nav .brand { font-weight: 700; font-size: 18px; }
        .sp-content { padding: 32px 16px; max-width: 800px; margin: 0 auto; }
        .sp-content h1 { text-align: center; margin: 0 0 8px; }
        .sp-content p.sub { text-align: center; opacity: 0.7; margin-bottom: 32px; }

        /* Ticket cards */
        .sp-tickets { display: flex; justify-content: space-around; gap: 16px; flex-wrap: wrap; }
        .sp-ticket {
          background: rgba(255,255,255,0.85); color: #333;
          padding: 20px; border-radius: 10px; width: 30%; min-width: 180px;
          text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);
        }
        .sp-ticket:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
        .sp-ticket .emoji { font-size: 48px; margin-bottom: 8px; }
        .sp-ticket h5 { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
        .sp-ticket p { margin: 4px 0; font-size: 13px; color: #666; }
        .sp-ticket .price { font-size: 22px; font-weight: 700; margin: 8px 0; }
        .sp-ticket-btn {
          display: inline-block; padding: 8px 20px; border-radius: 5px;
          color: white; font-size: 14px; border: none; cursor: pointer; font-weight: 600;
          margin-top: 8px; font-family: inherit;
        }
        .sp-btn-blue { background: #007bff; } .sp-btn-blue:hover { background: #0069d9; }
        .sp-btn-yellow { background: #ffc107; color: #000; } .sp-btn-yellow:hover { background: #e0a800; }
        .sp-btn-red { background: #dc3545; } .sp-btn-red:hover { background: #c82333; }

        /* Form container - dark glass like original */
        .sp-form-container {
          background: rgba(0,0,0,0.6); padding: 24px; border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3); backdrop-filter: blur(5px);
          max-width: 600px; margin: 0 auto;
        }
        .sp-form-container h2, .sp-form-container h3 { color: white; margin: 0 0 12px; }
        .sp-form-container label { display: block; font-size: 14px; margin-bottom: 4px; color: #ccc; }
        .sp-form-container input, .sp-form-container select {
          width: 100%; padding: 8px 12px; border: 1px solid #555; border-radius: 6px;
          background: rgba(255,255,255,0.1); color: white; font-size: 14px;
          margin-bottom: 12px; outline: none; font-family: inherit;
        }
        .sp-form-container input:focus, .sp-form-container select:focus { border-color: #007bff; }
        .sp-form-container select option { background: #1a2740; color: white; }
        .sp-form-container .btn-success {
          background: #198754; color: white; padding: 10px 24px; border: none;
          border-radius: 5px; font-size: 15px; cursor: pointer; font-family: inherit;
        }
        .sp-form-container .btn-success:hover { background: #157347; }
        .sp-alert-danger {
          background: rgba(220,53,69,0.2); border: 1px solid rgba(220,53,69,0.4);
          color: #ffaaaa; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 13px;
        }
        .sp-alert-danger ul { margin: 0; padding-left: 20px; }

        /* Confirmation */
        .sp-confirmation { text-align: center; }
        .sp-confirmation h2 { margin-bottom: 8px; }
        .sp-confirmation .info-block {
          background: rgba(255,255,255,0.08); border-radius: 8px;
          padding: 16px; margin: 12px 0; text-align: left;
        }
        .sp-confirmation .info-block p { margin: 4px 0; font-size: 14px; }
        .sp-confirmation .btn-primary {
          background: #007bff; color: white; padding: 10px 24px; border: none;
          border-radius: 5px; font-size: 15px; cursor: pointer; margin-top: 16px; font-family: inherit;
        }

        /* History */
        .sp-history { margin-top: 24px; }
        .sp-history table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sp-history th { background: rgba(255,255,255,0.1); padding: 8px; text-align: left; }
        .sp-history td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      `}</style>

      <div className="sp-wrap">
        <div className="sp-nav">
          <span className="brand">🎫 TicketConcert</span>
          <span style={{fontSize:13,opacity:0.7}}>ASP.NET Core MVC · Entity Framework</span>
        </div>

        <div className="sp-content">
          {/* SELECT */}
          {step === "select" && (
            <>
              <h1>Bienvenue sur TicketConcert</h1>
              <p className="sub">Réservez vos billets maintenant !</p>
              <div className="sp-tickets">
                {TICKET_TYPES.map((t) => (
                  <div key={t.name} className="sp-ticket" onClick={() => selectType(t.name)}>
                    <div className="emoji">{t.emoji}</div>
                    <h5>Billet {t.name}</h5>
                    <p>{t.desc}</p>
                    <div className="price">{t.price.toFixed(2)} $</div>
                    <button className={`sp-ticket-btn ${t.btnClass}`}>Commander</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* FORM */}
          {step === "form" && (
            <div className="sp-form-container">
              {Object.keys(errors).length > 0 && (
                <div className="sp-alert-danger">
                  <ul>{Object.values(errors).map((e,i) => <li key={i}>{e}</li>)}</ul>
                </div>
              )}
              <h2 style={{textAlign:"center"}}>Réserver un billet</h2>
              <form onSubmit={handleSubmit}>
                <h3>Informations du Client</h3>
                <label>Nom</label><input value={client.nom} onChange={(e)=>setClient({...client,nom:e.target.value})} />
                <label>Prénom</label><input value={client.prenom} onChange={(e)=>setClient({...client,prenom:e.target.value})} />
                <label>Téléphone</label><input value={client.telephone} onChange={(e)=>setClient({...client,telephone:e.target.value})} />
                <label>Date de naissance</label><input type="date" value={client.dateNaissance} onChange={(e)=>setClient({...client,dateNaissance:e.target.value})} />
                <label>Adresse</label><input value={client.adresse} onChange={(e)=>setClient({...client,adresse:e.target.value})} />

                <h3>Informations de la Commande</h3>
                <label>Type de billet</label>
                <select value={commande.typeBillet} onChange={(e)=>setCommande({...commande,typeBillet:e.target.value})}>
                  {TICKET_TYPES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <label>Nombre de billets</label>
                <input type="number" min="1" max="10" value={commande.nombreBillets} onChange={(e)=>setCommande({...commande,nombreBillets:e.target.value})} />

                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button type="submit" className="btn-success" disabled={submitting}>{submitting ? "..." : "Commander"}</button>
                  <button type="button" style={{background:"#6c757d",color:"white",padding:"10px 20px",border:"none",borderRadius:5,cursor:"pointer"}} onClick={reset}>Retour</button>
                </div>
              </form>
            </div>
          )}

          {/* CONFIRMATION */}
          {step === "confirmation" && confirmation && (
            <div className="sp-form-container sp-confirmation">
              <h2>Commande Confirmée !</h2>
              <p>TicketConcert vous remercie pour votre achat!<br/>Votre commande a bien été enregistrée.</p>
              <div className="info-block">
                <h3>Informations du Client</h3>
                <p>Identification : <strong>{confirmation.client.id}</strong></p>
                <p>Nom : <strong>{confirmation.client.nom}</strong></p>
                <p>Prénom : <strong>{confirmation.client.prenom}</strong></p>
                <p>Téléphone : <strong>{confirmation.client.telephone}</strong></p>
                <p>Adresse : <strong>{confirmation.client.adresse}</strong></p>
              </div>
              <div className="info-block">
                <h3>Résumé de la Commande #{confirmation.commande.id}</h3>
                <p>Type de billet : <strong>{confirmation.commande.type_billet}</strong></p>
                <p>Nombre de billets : <strong>{confirmation.commande.nombre_billets}</strong></p>
                <p>Date de commande : {new Date(confirmation.commande.date_commande).toLocaleString("fr")}</p>
              </div>
              <button className="btn-primary" onClick={reset}>Retour à l'accueil</button>
            </div>
          )}

          {/* History */}
          <div className="sp-history">
            <button onClick={() => setShowHistory(!showHistory)} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"white",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12,marginTop:16}}>
              {showHistory ? "Masquer" : "Historique"} ({allCommandes.length})
            </button>
            {showHistory && allCommandes.length > 0 && (
              <table style={{marginTop:12}}>
                <thead><tr><th>#</th><th>Client</th><th>Billet</th><th>Qté</th><th>Date</th></tr></thead>
                <tbody>
                  {allCommandes.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td><td>{c.prenom} {c.nom}</td><td>{c.type_billet}</td>
                      <td>{c.nombre_billets}</td><td>{new Date(c.date_commande).toLocaleDateString("fr")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
