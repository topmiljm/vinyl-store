const db = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createCheckoutSession } = require("../services/StripeService");

const checkout = async (req, res) => {
  const { cart, userId } = req.body;

  try {
    const session = await createCheckoutSession(cart, userId);
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const webhook = (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const cartMeta = JSON.parse(session.metadata.cart);
    const total = session.amount_total;
    const userId = session.metadata.user_id || null;

    console.log("✅ Payment received!");
    console.log("userId:", userId);

    try {
      // ✅ better-sqlite3: prepared statements
      const insertOrder = db.prepare(
        "INSERT INTO orders (total, user_id) VALUES (?, ?)"
      );

      const getProduct = db.prepare(
        "SELECT title FROM products WHERE id = ?"
      );

      const insertItem = db.prepare(
        "INSERT INTO order_items (order_id, title, price, quantity) VALUES (?, ?, ?, ?)"
      );

      // ✅ insert order
      const result = insertOrder.run(total, userId);
      const orderId = result.lastInsertRowid;

      // (optional but recommended) transaction for safety
      const insertOrderItems = db.transaction((items) => {
        for (const item of items) {
          const product = getProduct.get(item.id);

          if (!product) {
            throw new Error(`Product not found: ${item.id}`);
          }

          insertItem.run(
            orderId,
            product.title,
            item.price,
            item.quantity
          );
        }
      });

      insertOrderItems(cartMeta);

      console.log("✅ Order saved:", orderId);
    } catch (err) {
      console.error("❌ Failed to save order:", err.message);
    }
  }

  res.json({ received: true });
};

module.exports = { checkout, webhook };