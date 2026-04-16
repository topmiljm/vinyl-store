const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

router.get("/my-orders", authMiddleware, (req, res) => {
  db.all(`
    SELECT
      orders.id AS order_id,
      orders.total,
      orders.created_at,
      order_items.title,
      order_items.quantity
    FROM orders
    LEFT JOIN order_items ON orders.id = order_items.order_id
    WHERE orders.user_id = ?
  `, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const orders = {};
    rows.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          id: row.order_id,
          total: row.total,
          created_at: row.created_at,
          items: []
        };
      }
      if (row.title) {
        orders[row.order_id].items.push({
          title: row.title,
          quantity: row.quantity
        });
      }
    });

    res.json(Object.values(orders));
  });
});

module.exports = router;