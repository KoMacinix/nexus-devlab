const express = require("express");
const { getDB } = require("../config/sqlite");

const router = express.Router();

// ── Simulation des Data Annotations C# (.NET validation) ──
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

// ── GET /api/tickets/types ── Liste des types de billets
router.get("/types", (_req, res) => {
  res.json([
    { name: "Standard", price: 49.99, description: "Accès général au concert" },
    { name: "VIP", price: 149.99, description: "Accès VIP avec zone réservée" },
    { name: "Premium", price: 249.99, description: "Accès Premium backstage inclus" },
  ]);
});

// ── POST /api/tickets/commande ── Créer une commande (simule CommandeController.Create POST)
router.post("/commande", (req, res) => {
  try {
    const { client, commande } = req.body;

    // Validation (simule ModelState.IsValid + Data Annotations)
    const clientErrors = validateClient(client || {});
    const commandeErrors = validateCommande(commande || {});
    const allErrors = { ...clientErrors, ...commandeErrors };

    if (Object.keys(allErrors).length > 0) {
      return res.status(422).json({ errors: allErrors, valid: false });
    }

    const db = getDB();

    // Insérer le client (simule _context.Clients.Add())
    const clientInfo = db
      .prepare(
        "INSERT INTO ticket_clients (nom, prenom, telephone, date_naissance, adresse) VALUES (?, ?, ?, ?, ?)"
      )
      .run(client.nom, client.prenom, client.telephone, client.dateNaissance, client.adresse);

    // Insérer la commande (simule _context.Commandes.Add())
    const commandeInfo = db
      .prepare(
        "INSERT INTO ticket_commandes (client_id, type_billet, nombre_billets, date_commande) VALUES (?, ?, ?, ?)"
      )
      .run(
        clientInfo.lastInsertRowid,
        commande.typeBillet,
        Number(commande.nombreBillets),
        new Date().toISOString()
      );

    // Retourner la confirmation (simule Confirmation view)
    const savedClient = db.prepare("SELECT * FROM ticket_clients WHERE id = ?").get(clientInfo.lastInsertRowid);
    const savedCommande = db.prepare("SELECT * FROM ticket_commandes WHERE id = ?").get(commandeInfo.lastInsertRowid);

    res.status(201).json({
      commande: savedCommande,
      client: savedClient,
      message: "Commande confirmée !",
    });
  } catch (err) {
    console.error("Ticket error:", err);
    res.status(500).json({ error: "Erreur lors de la création de la commande" });
  }
});

// ── GET /api/tickets/commandes ── Liste toutes les commandes (simule Include + LINQ)
router.get("/commandes", (_req, res) => {
  try {
    const db = getDB();
    const rows = db
      .prepare(
        `SELECT c.*, cl.nom, cl.prenom, cl.telephone, cl.adresse
         FROM ticket_commandes c
         JOIN ticket_clients cl ON c.client_id = cl.id
         ORDER BY c.date_commande DESC`
      )
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture commandes" });
  }
});

// ── GET /api/tickets/commande/:id ── Détail d'une commande (simule Confirmation GET)
router.get("/commande/:id", (req, res) => {
  try {
    const db = getDB();
    const row = db
      .prepare(
        `SELECT c.*, cl.nom, cl.prenom, cl.telephone, cl.date_naissance, cl.adresse
         FROM ticket_commandes c
         JOIN ticket_clients cl ON c.client_id = cl.id
         WHERE c.id = ?`
      )
      .get(req.params.id);
    if (!row) return res.status(404).json({ error: "Commande introuvable" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture commande" });
  }
});

module.exports = router;
