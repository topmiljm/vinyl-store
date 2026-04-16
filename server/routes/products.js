const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/products", (req, res) => {
  const { title, artist, image, price } = req.body;

  db.run(
    "INSERT OR IGNORE INTO products (title, artist, image, price) VALUES (?, ?, ?, ?)",
    [title, artist, image, price],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // If already exists, fetch the existing row
      db.get("SELECT * FROM products WHERE title = ? AND artist = ?", [title, artist], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row); // ✅ returns product with real DB id
      });
    }
  );
});

module.exports = router;