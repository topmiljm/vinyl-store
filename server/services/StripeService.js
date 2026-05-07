const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (cart, userId = null) => {

  const cartMeta = cart.map(({ id, quantity, price, title }) => ({
    id,
    quantity,
    price,
    title
  }));

  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          ...(item.image && { images: [item.image] }),
        },
        unit_amount: item.price
      },
      quantity: item.quantity
    })),
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    
    customer_creation: "always",

    metadata: {
      cart: JSON.stringify(cartMeta),
      ...(userId && { user_id: String(userId) })
    }
  });
};

module.exports = { createCheckoutSession };