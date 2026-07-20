import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Import your context object
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  // 1. Properly consume context using useContext hook
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = async () => {
    try {
      // 2. Make the POST request to your Express server
      await axios.post("http://localhost:8080/newOrder", {
        name: uid,
        qty: Number(stockQuantity), // Ensure numeric types
        price: Number(stockPrice),
        mode: "BUY",
      });

      console.log("Order submitted successfully!");

      // 3. Close window ONLY after POST request succeeds
      if (generalContext && generalContext.closeBuyWindow) {
        generalContext.closeBuyWindow();
      }
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  const handleCancelClick = () => {
    if (generalContext && generalContext.closeBuyWindow) {
      generalContext.closeBuyWindow();
    }
  };

  return (
    <div className="container" id="buy-window" draggable="true">
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
          <Link to="#" className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </Link>
          <Link to="#" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
