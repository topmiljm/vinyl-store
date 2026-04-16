const db = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createCheckoutSession } = require("../services/StripeService");

const checkout = async (req, res) => {
  const { cart, userId } = req.body;
  console.log("userId received from frontend:", userId);
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
    console.log("user_id from metadata:", session.metadata.user_id); // ✅ is it arriving?
    console.log("cart from metadata:", session.metadata.cart);        // ✅ is cart there?
    const cartMeta = JSON.parse(session.metadata.cart);
    const total = session.amount_total;
    const userId = session.metadata.user_id || null;
    console.log("userId being saved:", userId);                        // ✅ null or a number?

    console.log("✅ Payment received!");

    db.run("INSERT INTO orders (total, user_id) VALUES (?, ?)", [total, userId], function (err) {
      if (err) return console.error(err);
      const orderId = this.lastID;

      // ✅ Wrap each item insert in a Promise so they all complete
      const insertPromises = cartMeta.map(item => {
        return new Promise((resolve, reject) => {
          db.get("SELECT title FROM products WHERE id = ?", [item.id], (err, product) => {
            if (err || !product) return reject(`Product not found: ${item.id}`);

            db.run(
              "INSERT INTO order_items (order_id, title, price, quantity) VALUES (?, ?, ?, ?)",
              [orderId, product.title, item.price, item.quantity],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });
        });
      });

      Promise.all(insertPromises)
        .then(() => console.log("✅ Order saved:", orderId))
        .catch(err => console.error("❌ Failed to save order items:", err));
    });
  }

  res.json({ received: true }); // ✅ Stripe gets its response immediately
};

module.exports = { checkout, webhook };