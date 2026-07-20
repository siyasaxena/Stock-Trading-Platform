import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Import your context object
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  // 1. Properly consume context using useContext hook
  const generalContext = useContext(GeneralContext);

  const handleSellClick = async () => {
    try {
      // Safely parse numbers with fallbacks to avoid passing NaN to Mongoose
      const parsedQty = parseFloat(stockQuantity) || 0;
      const parsedPrice = parseFloat(stockPrice) || 0;

      // Make the POST request to your Express backend
      await axios.post("http://localhost:8080/sellOrder", {
        name: uid,
        qty: parsedQty,
        price: parsedPrice,
        mode: "SELL",
      });

      console.log("Sell order executed! ");

      // 3. Close window ONLY after POST request succeeds
      if (generalContext && generalContext.closeSellWindow) {
        generalContext.closeSellWindow();
      }
    } catch (error) {
      console.error("Failed to execute sell order:", error);
    }
  };

  const handleCancelClick = () => {
    if (generalContext && generalContext.closeSellWindow) {
      generalContext.closeSellWindow();
    }
  };

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <button className="btn btn-orange" onClick={handleSellClick}>
            Sell
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
