require("dotenv").config();

const dburl = process.env.MONGO_URL;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { HoldingsModel } = require("./models/HoldingsModel");
const path = require("path");
const ejsMate = require("ejs-mate");
const { PositionsSchema } = require("./schemas/PositionsSchema");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");
const cookieParser = require("cookie-parser");
const { verifyToken, checkRole } = require("./middleware/auth");
const authRoutes = require("./routes/auth");

main()
  .then(() => {
    console.log("connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

// Allowed origins array dynamically cleaned of undefined/empty values
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://stock-trading-frontend-so2m.onrender.com",
  "https://stock-trading-dashboard-qdnt.onrender.com",
  process.env.DASHBOARD_CLIENT_URL,
  process.env.FRONTEND_CLIENT_URL,
].filter(Boolean);

// Dynamic CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/allHoldings", verifyToken, async (req, res) => {
  try {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (err) {
    console.error("error caught", err);
  }
});

app.get("/allPositions", verifyToken, async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (err) {
    console.log("error caught", err);
  }
});

// Post call for new buy order
app.post("/newOrder", verifyToken, async (req, res) => {
  try {
    const { name, qty, price } = req.body;
    const numericQty = Number(qty);
    const numericPrice = Number(price);

    // Basic Input Validation
    if (
      !name ||
      isNaN(numericQty) ||
      isNaN(numericPrice) ||
      numericQty <= 0 ||
      numericPrice <= 0
    ) {
      return res.status(400).send("Invalid order inputs.");
    }

    // 1. Save to orders collection
    const newOrder = new OrdersModel({
      name,
      qty: numericQty,
      price: numericPrice,
      mode: "BUY",
    });
    await newOrder.save();

    // 2. Update or insert into holdings collection
    let existingHolding = await HoldingsModel.findOne({ name });

    if (existingHolding) {
      // Calculate weighted average cost
      const totalQty = existingHolding.qty + numericQty;
      const totalCost =
        existingHolding.qty * existingHolding.avg + numericQty * numericPrice;
      const newAvg = totalCost / totalQty;

      existingHolding.qty = totalQty;
      existingHolding.avg = newAvg;
      existingHolding.price = numericPrice; // Update current market LTP
      await existingHolding.save();
    } else {
      // Create new holding entry
      const newHolding = new HoldingsModel({
        name,
        qty: numericQty,
        avg: numericPrice,
        price: numericPrice,
        net: "+0.00%",
        day: "+0.00%",
        isLoss: false,
      });
      await newHolding.save();
    }

    res.status(201).send("Order executed & Holdings updated!");
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Failed to process order.");
  }
});

// Post call for sell order
app.post("/sellOrder", verifyToken, async (req, res) => {
  try {
    const { name, qty, price } = req.body;
    const numericQty = parseFloat(qty);
    const numericPrice = parseFloat(price);

    // Basic Input Validation
    if (
      !name ||
      isNaN(numericQty) ||
      isNaN(numericPrice) ||
      numericQty <= 0 ||
      numericPrice <= 0
    ) {
      return res.status(400).send("Invalid order inputs.");
    }

    // 1. Check existing holding FIRST
    let existingHolding = await HoldingsModel.findOne({ name });

    if (!existingHolding || existingHolding.qty < numericQty) {
      return res.status(400).send("Insufficient stock quantity to sell.");
    }

    // 2. Save entry in Orders log (Only if check passes)
    let newOrder = new OrdersModel({
      name,
      qty: numericQty,
      price: numericPrice,
      mode: "SELL",
    });
    await newOrder.save();

    // 3. Deduct quantity or remove holding if zero
    if (existingHolding.qty === numericQty) {
      await HoldingsModel.deleteOne({ name });
    } else {
      existingHolding.qty -= numericQty;
      existingHolding.price = numericPrice; // Update current price
      await existingHolding.save();
    }

    res.status(200).send("Sell order executed & Holdings updated!");
  } catch (error) {
    console.error("Error executing sell order:", error);
    res.status(500).send("Failed to execute sell order.");
  }
});

// Route to fetch stock price from external API
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const apiKey = process.env.FINNHUB_API;

    // Finnhub API URL for real-time stock quotes
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await axios.get(url);

    if (response.data && response.data.c !== 0) {
      res.json({
        symbol: symbol,
        currentPrice: response.data.c,
        high: response.data.h,
        low: response.data.l,
        open: response.data.o,
        previousClose: response.data.pc,
        change: response.data.d,
        percentChange: response.data.dp,
      });
    } else {
      res.status(404).json({ message: "Stock symbol not found or invalid" });
    }
  } catch (error) {
    console.error("Finnhub Error:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data from Finnhub" });
  }
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
