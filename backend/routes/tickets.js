const express = require("express");
const { getPool } = require("../config/postgres");

const router = express.Router();

function validateClient(client) {
  const errors = {};
  if (!client.nom) errors["Client.Nom"] = "Le nom est obligatoire";
  if (!client.prenom) errors["Client.Prenom"] = "Le prénom est obligatoire";
  if (!client.telephone) errors["Client.Telephone"] = "Le numéro de téléphone est obligatoire";
  if (client.telephone && !/^[\d\s\-+()]+$/.test(client.telephone)) {
    errors["Client.Telephone"] = "Le numéro de téléphone n'est pas valide";
  }
  if (!client.dateNaissance) errors["Client.DateNaissance"] = "La date de naissance est obligatoire";
  if (!client.adresse) errors["Client.Adresse"] = "L'adresse est obligatoire";
  return errors;
}

function validateCommande(commande) {
  const errors = {};
  const validTypes = ["Standard", "VIP", "Premium"];
  if (!commande.typeBillet || !validTypes.includes(commande.typeBillet)) {
    errors["Commande.TypeBillet"] = "Sélectionnez un type de billet valide (Standard, VIP, Premium)";
  }
  if (!commande.nombreBillets || commande.nombreBillets < 1 || commande.nombreBillets > 10) {
    errors["Commande.NombreBillets"] = "Vous pouvez commander entre 1 et 10 billets";
  }
  return errors;
}

// ── GET /api/tickets/types ──
router.get("/types", (_req, res) => {
  res.json([
    { name: "Standard", price: 49.99, description: "Accès général au concert" },
    { name: "VIP", price: 149.99, description: "Accès VIP avec zone réservée" },
    { name: "Premium", price: 249.99, description: "Accès Premium backstage inclus" },
  ]);
});

// ── POST /api/tickets/commande ──
router.post("/commande", async (req, res) => {
  try {
    const { client, commande } = req.body;

    const clientErrors = validateClient(client || {});
    const commandeErrors = validateCommande(commande || {});
    const allErrors = { ...clientErrors, ...commandeErrors };
    if (Object.keys(allErrors).length > 0) {
      return res.status(422).json({ errors: allErrors, valid: false });
    }

    const pool = getPool();

    const clientRes = await pool.query(
      "INSERT INTO ticket_clients (nom, prenom, telephone, date_naissance, adresse) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [client.nom, client.prenom, client.telephone, client.dateNaissance, client.adresse]
    );
    const savedClient = clientRes.rows[0];

    const commandeRes = await pool.query(
      "INSERT INTO ticket_commandes (client_id, type_billet, nombre_billets, date_commande) VALUES ($1,$2,$3,$4) RETURNING *",
      [savedClient.id, commande.typeBillet, Number(commande.nombreBillets), new Date().toISOString()]
    );
    const savedCommande = commandeRes.rows[0];

    res.status(201).json({ commande: savedCommande, client: savedClient, message: "Commande confirmée !" });
  } catch (err) {
    console.error("Ticket error:", err);
    res.status(500).json({ error: "Erreur lors de la création de la commande" });
  }
});

// ── GET /api/tickets/commandes ──
router.get("/commandes", async (_req, res) => {
  try {
    const { rows } = await getPool().query(
      `SELECT c.*, cl.nom, cl.prenom, cl.telephone, cl.adresse
       FROM ticket_commandes c
       JOIN ticket_clients cl ON c.client_id = cl.id
       ORDER BY c.date_commande DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture commandes" });
  }
});

// ── GET /api/tickets/commande/:id ──
router.get("/commande/:id", async (req, res) => {
  try {
    const { rows } = await getPool().query(
      `SELECT c.*, cl.nom, cl.prenom, cl.telephone, cl.date_naissance, cl.adresse
       FROM ticket_commandes c
       JOIN ticket_clients cl ON c.client_id = cl.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Commande introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture commande" });
  }
});

module.exports = router;
