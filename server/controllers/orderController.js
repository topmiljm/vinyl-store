const db = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createCheckoutSession } = require("../services/StripeService");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

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

const webhook = async (req, res) => {
  let event;

  console.log("📨 Webhook received");

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified, event type:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("💳 Session ID:", session.id);
    console.log("📧 Customer email:", session.customer_details?.email);
    console.log("💰 Amount total:", session.amount_total);
    console.log("🗂️ Raw metadata:", JSON.stringify(session.metadata));

    let cartMeta;
    try {
      cartMeta = JSON.parse(session.metadata.cart);
      console.log("🛒 Parsed cart:", JSON.stringify(cartMeta));
    } catch (err) {
      console.error("❌ Failed to parse cart metadata:", err.message);
      return res.json({ received: true });
    }

    const total = session.amount_total;
    const userId = session.metadata.user_id || null;
    console.log("👤 userId:", userId);

    try {
      const insertOrder = db.prepare(
        "INSERT INTO orders (total, user_id) VALUES (?, ?)"
      );
      const getProduct = db.prepare(
        "SELECT title FROM products WHERE id = ?"
      );
      const insertItem = db.prepare(
        "INSERT INTO order_items (order_id, title, price, quantity) VALUES (?, ?, ?, ?)"
      );

      const result = insertOrder.run(total, userId);
      const orderId = result.lastInsertRowid;
      console.log("✅ Order inserted, orderId:", orderId);

      const insertOrderItems = db.transaction((items) => {
        for (const item of items) {
          console.log("🔍 Looking up product id:", item.id);
          const product = getProduct.get(item.id);

          if (!product) {
            throw new Error(`Product not found: ${item.id}`);
          }

          console.log("✅ Found product:", product.title);
          insertItem.run(orderId, product.title, item.price, item.quantity);
          item.title = product.title;
        }
      });

      insertOrderItems(cartMeta);
      console.log("✅ All order items inserted");

      const emailTo = session.customer_details?.email;
      console.log("📧 Sending email to:", emailTo);

      if (!emailTo) {
        console.error("❌ No customer email found on session — skipping email");
      } else {
        const emailResult = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: emailTo,
          subject: "Your Order Confirmation 🎵",
          html: `
            <h2>Thanks for your order!</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total:</strong> $${(total / 100).toFixed(2)}</p>
            <h3>Items:</h3>
            <ul>
              ${cartMeta.map(item => `
                <li>
                  ${item.title || "Item"} x ${item.quantity}
                  - $${(item.price * item.quantity / 100).toFixed(2)}
                </li>
              `).join("")}
            </ul>
            <p>We'll get your vinyl spinning soon 🎶</p>
          `
        });

        console.log("📧 Resend response:", JSON.stringify(emailResult));

        if (emailResult?.error) {
          console.error("❌ Resend error:", JSON.stringify(emailResult.error));
        } else {
          console.log("✅ Email sent successfully, id:", emailResult?.data?.id);
        }
      }

    } catch (err) {
      console.error("❌ Failed to save order or send email:", err.message);
      console.error(err.stack);
    }
  } else {
    console.log("ℹ️ Unhandled event type:", event.type);
  }

  res.json({ received: true });
};

module.exports = { checkout, webhook };