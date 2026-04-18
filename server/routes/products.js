const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all products
router.get("/products", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM products").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD product (or return existing)
router.post("/products", (req, res) => {
  const { title, artist, image, price } = req.body;

  try {
    // Insert (ignore if duplicate)
    db.prepare(`
      INSERT OR IGNORE INTO products (title, artist, image, price)
      VALUES (?, ?, ?, ?)
    `).run(title, artist, image, price);

    // Always fetch the product (new OR existing)
    const product = db.prepare(`
      SELECT * FROM products
      WHERE title = ? AND artist = ?
    `).get(title, artist);

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;