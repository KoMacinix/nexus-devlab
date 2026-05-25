const express = require("express");
const { getPool } = require("../config/postgres");

const router = express.Router();

// ── GET /api/products ── Liste tous les produits
router.get("/", async (_req, res) => {
  try {
    const { rows } = await getPool().query("SELECT * FROM products ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lecture produits" });
  }
});

// ── GET /api/products/shopping ── Liste d'achat (quantité < seuil)
router.get("/shopping", async (_req, res) => {
  try {
    const { rows } = await getPool().query(
      "SELECT * FROM products WHERE quantity < min_threshold ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur liste d'achat" });
  }
});

// ── POST /api/products ── Ajouter un produit
router.post("/", async (req, res) => {
  try {
    const { name, description, product_type, quantity, min_threshold } = req.body;

    if (!name) return res.status(400).json({ error: "Le nom est requis" });
    if ((quantity != null && quantity < 0) || (min_threshold != null && min_threshold < 0)) {
      return res.status(400).json({ error: "Les valeurs ne peuvent pas être négatives" });
    }

    const { rows } = await getPool().query(
      "INSERT INTO products (name, description, product_type, quantity, min_threshold) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description || "", product_type || "", Number(quantity) || 0, Number(min_threshold) || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur ajout produit" });
  }
});

// ── PUT /api/products/:id ── Modifier un produit
router.put("/:id", async (req, res) => {
  try {
    const { name, description, product_type, quantity, min_threshold } = req.body;
    const { id } = req.params;

    if (!name) return res.status(400).json({ error: "Le nom est requis" });
    if ((quantity != null && quantity < 0) || (min_threshold != null && min_threshold < 0)) {
      return res.status(400).json({ error: "Les valeurs ne peuvent pas être négatives" });
    }

    const existing = await getPool().query("SELECT * FROM products WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Produit introuvable" });

    const { rows } = await getPool().query(
      "UPDATE products SET name=$1, description=$2, product_type=$3, quantity=$4, min_threshold=$5 WHERE id=$6 RETURNING *",
      [name, description || "", product_type || "", Number(quantity) || 0, Number(min_threshold) || 0, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur modification produit" });
  }
});

// ── DELETE /api/products/:id ── Supprimer un produit
router.delete("/:id", async (req, res) => {
  try {
    const existing = await getPool().query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Produit introuvable" });

    await getPool().query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: "Produit supprimé", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur suppression produit" });
  }
});

module.exports = router;
