require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const searchRoutes = require("./routes/search");
const authRoutes = require("./routes/auth");
const myOrdersRoutes = require("./routes/myOrders");
const { webhook } = require("./controllers/orderController");

const app = express();

// ✅ Webhook MUST come before express.json()
app.post("/webhook", express.raw({ type: "application/json" }), webhook);

app.use(cors({
  origin: ["http://localhost:3000", process.env.CLIENT_URL],
  credentials: true,
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/products", productRoutes);
app.use("/create-checkout-session", orderRoutes);
app.use("/search", searchRoutes);
app.use("/auth", authRoutes);
app.use("/orders", myOrdersRoutes);

app.get("/", (req, res) => {
  res.send("Vinyl Store API running 🎵");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));