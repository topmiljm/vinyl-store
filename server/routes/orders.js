const express = require("express");
const router = express.Router();
const { checkout, webhook } = require("../controllers/orderController");
const db = require("../db");

router.post("/create-checkout-session", checkout);
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        orders.id AS order_id,
        orders.total,
        orders.created_at,
        order_items.title,
        order_items.quantity
      FROM orders
      LEFT JOIN order_items 
        ON orders.id = order_items.order_id
    `).all();

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

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;