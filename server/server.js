require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const searchRoutes = require("./routes/search");
const authRoutes = require("./routes/auth");
const myOrdersRoutes = require("./routes/myOrders");

const app = express();

// webhook must come BEFORE json middleware
app.use("/webhook", express.raw({ type: "application/json" }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.CLIENT_URL
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/products", productRoutes);
app.use("/create-checkout-session", orderRoutes);
app.use("/search", searchRoutes);
app.use("/auth", authRoutes);
app.use("/my-orders", myOrdersRoutes);

app.get("/", (req, res) => {
  res.send("Vinyl Store API running 🎵");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});