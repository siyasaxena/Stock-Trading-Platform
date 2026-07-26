// Handle Registration and Login, returning a JWT token.

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel.js");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// 1. Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ username, email, password, role });
    await user.save(); // 👈 This will work smoothly now!

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, role: user.role },
      token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
