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

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      process.env.DASHBOARD_CLIENT_URL,
      process.env.FRONTEND_CLIENT_URL,
    ],
    credentials: true, // 👈 Allows cookies to be sent and received cross-origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/api/auth", authRoutes);

// route
// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((obj) => {
//     let newHolding = new HoldingsModel({
//       name: obj.name,
//       qty: obj.qty,
//       avg: obj.avg,
//       price: obj.price,
//       net: obj.net,
//       day: obj.day,
//     });
//     newHolding.save();
//   });
//   res.send("done");
// });
app.get("/", (req, res) => {
  res.send("Server is running!");
});
// app.get("/addPositions", async (req, res) => {
//   try {
//     let tempPosition = [
//       {
//         product: "CNC",
//         name: "EVEREADY",
//         qty: 2,
//         avg: 316.27,
//         price: 312.35,
//         net: "+0.58%",
//         day: "-1.24%",
//         isLoss: true,
//       },
//       {
//         product: "CNC",
//         name: "JUBLFOOD",
//         qty: 1,
//         avg: 3124.75,
//         price: 3082.65,
//         net: "+10.04%",
//         day: "-1.35%",
//         isLoss: true,
//       },
//     ];

//     await PositionsModel.insertMany(tempPosition);

//     res.status(200).send("Positions saved successfully");
//   } catch (error) {
//     console.error("Database save failed:", error);
//     res.status(500).send("Failed to save positions");
//   }
// });

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

// post call
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
      // Calculate weighted average cost: ((oldQty * oldAvg) + (newQty * newPrice)) / totalQty
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
    console.log("Current Finnhub Key:", apiKey); // 👈 Check terminal output!

    // Finnhub API URL for real-time stock quotes
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await axios.get(url);

    /* 
      Finnhub response object fields:
      c: Current price, h: High, l: Low, o: Open, pc: Previous close, d: Change, dp: Percent change
    */
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
