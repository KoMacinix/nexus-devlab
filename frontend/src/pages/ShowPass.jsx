import { useState, useEffect } from "react";
import api from "../api";

/* ── TicketConcert — fidèle à l'original : vraie image concert, gradient navbar, images billets, dark glass form ── */

const TICKET_TYPES = [
  { name: "Standard", price: 49.99, img: "/ticketconcert/standard.png", btnClass: "sp-btn-blue", desc: "Accès général à l'événement." },
  { name: "VIP", price: 149.99, img: "/ticketconcert/vip.png", btnClass: "sp-btn-yellow", desc: "Accès et services exclusifs." },
  { name: "Premium", price: 249.99, img: "/ticketconcert/premium.png", btnClass: "sp-btn-red", desc: "Meilleures places et accès en coulisses." },
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
        /* ── Background : vraie image concert (original: background.jpg cover) ── */
        .tc-wrap {
          margin: -16px; min-height: calc(100vh - 200px);
          background: url('/ticketconcert/background.jpg') no-repeat center center;
          background-size: cover;
          font-family: system-ui, -apple-system, sans-serif; color: white;
          display: flex; flex-direction: column;
        }

        /* ── Navbar (original: gradient blue, opacity: 0.5) ── */
        .tc-nav {
          background: linear-gradient(to right, #004aad, #1e3c72);
          opacity: 0.85;
          height: 60px; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .tc-nav .brand { font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 8px; }
        .tc-nav .brand img { height: 40px; width: auto; }
        .tc-nav .nav-link { color: white; font-size: 13px; opacity: 0.8; }

        .tc-content { padding: 32px 16px; max-width: 900px; margin: 0 auto; flex: 1; }
        .tc-content h1 { text-align: center; margin: 0 0 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
        .tc-content p.sub { text-align: center; opacity: 0.8; margin-bottom: 32px; }

        /* ── Ticket cards avec vraies images (original: rgba(255,255,255,0.8)) ── */
        .tc-tickets { display: flex; justify-content: space-around; gap: 16px; flex-wrap: wrap; margin-top: 20px; }
        .tc-ticket {
          background: rgba(255,255,255,0.85);
          color: #333; padding: 20px; border-radius: 8px;
          width: 30%; min-width: 220px; text-align: center;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .tc-ticket:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
        .tc-ticket .ticket-img { width: 100%; max-height: 120px; object-fit: contain; margin-bottom: 10px; border-radius: 6px; }
        .tc-ticket h5 { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
        .tc-ticket p { margin: 4px 0; font-size: 13px; color: #666; }
        .tc-ticket .price { font-size: 22px; font-weight: 700; margin: 8px 0; color: #333; }
        .tc-ticket-btn {
          display: inline-block; padding: 8px 20px; border-radius: 5px;
          color: white; font-size: 14px; border: none; cursor: pointer; font-weight: 600;
          margin-top: 8px; font-family: inherit;
        }
        .sp-btn-blue { background: #007bff; } .sp-btn-blue:hover { background: #0069d9; }
        .sp-btn-yellow { background: #ffc107; color: #000; } .sp-btn-yellow:hover { background: #e0a800; }
        .sp-btn-red { background: #dc3545; } .sp-btn-red:hover { background: #c82333; }

        /* ── Form container (original: rgba(0,0,0,0.6), blur(5px)) ── */
        .tc-form-container {
          background: rgba(0,0,0,0.6);
          padding: 20px; border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          max-width: 600px; margin: 0 auto; color: white;
        }
        .tc-form-container h2, .tc-form-container h3 { color: white; margin: 0 0 12px; }
        .tc-form-container label { display: block; font-size: 14px; margin-bottom: 4px; color: #ccc; }
        .tc-form-container input, .tc-form-container select {
          width: 100%; padding: 8px 12px; border: 1px solid #555; border-radius: 6px;
          background: rgba(255,255,255,0.1); color: white; font-size: 14px;
          margin-bottom: 12px; outline: none; font-family: inherit; box-sizing: border-box;
        }
        .tc-form-container input:focus, .tc-form-container select:focus { border-color: #007bff; }
        .tc-form-container select option { background: #1a2740; color: white; }
        .tc-form-container .btn-success {
          background: #198754; color: white; padding: 10px 24px; border: none;
          border-radius: 5px; font-size: 15px; cursor: pointer; font-family: inherit;
        }
        .tc-form-container .btn-success:hover { background: #157347; }
        .tc-alert-danger {
          background: rgba(220,53,69,0.2); border: 1px solid rgba(220,53,69,0.4);
          color: #ffaaaa; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 13px;
        }
        .tc-alert-danger ul { margin: 0; padding-left: 20px; }

        .tc-confirmation { text-align: center; }
        .tc-confirmation .info-block {
          background: rgba(255,255,255,0.08); border-radius: 8px;
          padding: 16px; margin: 12px 0; text-align: left;
        }
        .tc-confirmation .info-block p { margin: 4px 0; font-size: 14px; }
        .tc-confirmation .btn-primary {
          background: #007bff; color: white; padding: 10px 24px; border: none;
          border-radius: 5px; font-size: 15px; cursor: pointer; margin-top: 16px; font-family: inherit;
        }
        .tc-history { margin-top: 24px; }
        .tc-history table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tc-history th { background: rgba(255,255,255,0.1); padding: 8px; text-align: left; }
        .tc-history td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .tc-footer {
          background-color: rgba(0,0,0,0.8); color: white; text-align: center;
          padding: 10px; font-size: 12px;
        }
      `}</style>

      <div className="tc-wrap">
        <div className="tc-nav">
          <span className="brand"><img src="/ticketconcert/logo.png" alt="TicketConcert" /> TicketConcert</span>
          <span className="nav-link">ASP.NET Core MVC · Entity Framework</span>
        </div>

        <div className="tc-content">
          {step === "select" && (
            <>
              <h1>Bienvenue sur TicketConcert</h1>
              <p className="sub">Réservez vos billets maintenant !</p>
              <div className="tc-tickets">
                {TICKET_TYPES.map((t) => (
                  <div key={t.name} className="tc-ticket" onClick={() => selectType(t.name)}>
                    <img src={t.img} alt={`Billet ${t.name}`} className="ticket-img" />
                    <h5>Billet {t.name}</h5>
                    <p>{t.desc}</p>
                    <div className="price">{t.price.toFixed(2)} $</div>
                    <button className={`tc-ticket-btn ${t.btnClass}`}>Commander</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === "form" && (
            <div className="tc-form-container">
              {Object.keys(errors).length > 0 && (
                <div className="tc-alert-danger"><ul>{Object.values(errors).map((e,i) => <li key={i}>{e}</li>)}</ul></div>
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
                  <button type="button" style={{background:"#6c757d",color:"white",padding:"10px 20px",border:"none",borderRadius:5,cursor:"pointer",fontFamily:"inherit"}} onClick={reset}>Retour</button>
                </div>
              </form>
            </div>
          )}

          {step === "confirmation" && confirmation && (
            <div className="tc-form-container tc-confirmation">
              <h2>Commande Confirmée !</h2>
              <p>TicketConcert vous remercie pour votre achat!</p>
              <div className="info-block">
                <h3>Client</h3>
                <p>Nom : <strong>{confirmation.client.nom}</strong></p>
                <p>Prénom : <strong>{confirmation.client.prenom}</strong></p>
                <p>Téléphone : <strong>{confirmation.client.telephone}</strong></p>
                <p>Adresse : <strong>{confirmation.client.adresse}</strong></p>
              </div>
              <div className="info-block">
                <h3>Commande #{confirmation.commande.id}</h3>
                <p>Type : <strong>{confirmation.commande.type_billet}</strong></p>
                <p>Quantité : <strong>{confirmation.commande.nombre_billets}</strong></p>
                <p>Date : {new Date(confirmation.commande.date_commande).toLocaleString("fr")}</p>
              </div>
              <button className="btn-primary" onClick={reset}>Retour à l'accueil</button>
            </div>
          )}

          <div className="tc-history">
            <button onClick={() => setShowHistory(!showHistory)} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"white",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12,marginTop:16,fontFamily:"inherit"}}>
              {showHistory ? "Masquer" : "Historique"} ({allCommandes.length})
            </button>
            {showHistory && allCommandes.length > 0 && (
              <table style={{marginTop:12}}>
                <thead><tr><th>#</th><th>Client</th><th>Billet</th><th>Qté</th><th>Date</th></tr></thead>
                <tbody>
                  {allCommandes.map((c) => (
                    <tr key={c.id}><td>{c.id}</td><td>{c.prenom} {c.nom}</td><td>{c.type_billet}</td><td>{c.nombre_billets}</td><td>{new Date(c.date_commande).toLocaleDateString("fr")}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="tc-footer">© TicketConcert — Billetterie de concert</div>
      </div>
    </>
  );
}
