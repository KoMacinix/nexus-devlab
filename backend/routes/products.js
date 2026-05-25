const express = require("express");
const { getDB } = require("../config/sqlite");

const router = express.Router();

// ── GET /api/products ── Liste tous les produits
router.get("/", (_req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare("SELECT * FROM products ORDER BY name").all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lecture produits" });
  }
});

// ── GET /api/products/shopping ── Liste d'achat (quantité < seuil)
router.get("/shopping", (_req, res) => {
  try {
    const db = getDB();
    const rows = db
      .prepare("SELECT * FROM products WHERE quantity < min_threshold ORDER BY name")
      .all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur liste d'achat" });
  }
});

// ── POST /api/products ── Ajouter un produit
router.post("/", (req, res) => {
  try {
    const { name, description, product_type, quantity, min_threshold } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Le nom est requis" });
    }
    if ((quantity != null && quantity < 0) || (min_threshold != null && min_threshold < 0)) {
      return res.status(400).json({ error: "Les valeurs ne peuvent pas être négatives" });
    }

    const db = getDB();
    const info = db
      .prepare(
        "INSERT INTO products (name, description, product_type, quantity, min_threshold) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        name,
        description || "",
        product_type || "",
        Number(quantity) || 0,
        Number(min_threshold) || 0
      );

    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur ajout produit" });
  }
});

// ── PUT /api/products/:id ── Modifier un produit
router.put("/:id", (req, res) => {
  try {
    const { name, description, product_type, quantity, min_threshold } = req.body;
    const { id } = req.params;

    if (!name) {
      return res.status(400).json({ error: "Le nom est requis" });
    }
    if ((quantity != null && quantity < 0) || (min_threshold != null && min_threshold < 0)) {
      return res.status(400).json({ error: "Les valeurs ne peuvent pas être négatives" });
    }

    const db = getDB();
    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    db.prepare(
      "UPDATE products SET name = ?, description = ?, product_type = ?, quantity = ?, min_threshold = ? WHERE id = ?"
    ).run(
      name,
      description || "",
      product_type || "",
      Number(quantity) || 0,
      Number(min_threshold) || 0,
      id
    );

    const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur modification produit" });
  }
});

// ── DELETE /api/products/:id ── Supprimer un produit
router.delete("/:id", (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ message: "Produit supprimé", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur suppression produit" });
  }
});

module.exports = router;
