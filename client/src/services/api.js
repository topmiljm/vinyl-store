const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getProducts = async () => {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
};

export const searchProducts = async (term) => {
  const res = await fetch(`${API_URL}/search?term=${term}`);
  return res.json();
};

export const authRequest = async (endpoint, email, password) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res;
};

export const getOrders = async (token) => {
  const res = await fetch(`${API_URL}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createCheckoutSession = async (cart, userId) => {
  const res = await fetch(`${API_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart, userId }),
  });
  return res;
};

export const upsertProduct = async (product) => {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
};