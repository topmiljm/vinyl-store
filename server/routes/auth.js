const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// Prepared statements (reuse = faster + cleaner)
const insertUser = db.prepare(
  "INSERT INTO users (email, password) VALUES (?, ?)"
);

const getUserByEmail = db.prepare(
  "SELECT * FROM users WHERE email = ?"
);

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = insertUser.run(email, hashed);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email });
  } catch (err) {
    // better-sqlite3 throws on constraint violations
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ error: "Email already in use" });
    }

    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = getUserByEmail.get(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;