// import { holdings } from "../data/data";
import { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalChart.jsx";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldingsWithLivePrices = async () => {
      try {
        // Step 1: Get holdings list from your backend / MongoDB
        const res = await axios.get("http://localhost:8080/allHoldings", {
          withCredentials: true,
        });

        const holdingsFromDb = res.data;

        if (Array.isArray(holdingsFromDb) && holdingsFromDb.length > 0) {
          // Step 2: Fetch live prices from Finnhub for each holding in parallel
          const updatedHoldings = await Promise.all(
            holdingsFromDb.map(async (stock) => {
              try {
                // Call backend proxy route for Finnhub data
                const finnhubRes = await axios.get(
                  `http://localhost:8080/api/stock/${stock.name}`,
                  { withCredentials: true },
                );

                const liveData = finnhubRes.data;

                return {
                  ...stock,
                  // Overwrite LTP with live Finnhub price (fallback to DB price if undefined)
                  price: liveData.currentPrice || stock.price,
                  day: liveData.percentChange
                    ? `${liveData.percentChange.toFixed(2)}%`
                    : stock.day,
                  isLoss: liveData.change < 0,
                };
              } catch (err) {
                console.warn(
                  `Could not fetch Finnhub price for ${stock.name}:`,
                  err.message,
                );
                return stock; // Fallback to DB stock data on single request failure
              }
            }),
          );

          setAllHoldings(updatedHoldings);
        } else {
          setAllHoldings([]);
        }
      } catch (error) {
        console.error("Failed to load holdings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldingsWithLivePrices();
  }, []);

  // --- Chart & Metrics Calculations ---
  const labels = allHoldings.map((stock) => stock.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Live Market Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const totalInvestment = allHoldings.reduce(
    (acc, stock) => acc + (Number(stock.avg) || 0) * (Number(stock.qty) || 0),
    0,
  );

  const currentValue = allHoldings.reduce(
    (acc, stock) => acc + (Number(stock.price) || 0) * (Number(stock.qty) || 0),
    0,
  );

  const totalPnL = currentValue - totalInvestment;
  const pnlPercent =
    totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  if (loading) return <div>Fetching Live Finnhub Market Data...</div>;

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP (Finnhub)</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No holdings found in database.
                </td>
              </tr>
            ) : (
              allHoldings.map((stock, index) => {
                const qty = Number(stock.qty) || 0;
                const avg = Number(stock.avg) || 0;
                const price = Number(stock.price) || 0;

                const currValue = price * qty;
                const pnl = currValue - avg * qty;
                const isProfit = pnl >= 0;
                const profClass = isProfit ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";

                return (
                  <tr key={stock._id || index}>
                    <td>
                      <strong>{stock.name}</strong>
                    </td>
                    <td>{qty}</td>
                    <td>${avg.toFixed(2)}</td>
                    <td>
                      <strong>${price.toFixed(2)}</strong>
                    </td>
                    <td>${currValue.toFixed(2)}</td>
                    <td className={profClass}>${pnl.toFixed(2)}</td>
                    <td className={dayClass}>{stock.day}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Summary Footer */}
      <div className="row" style={{ marginTop: "20px" }}>
        <div className="col">
          <h5>${totalInvestment.toFixed(2)}</h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>${currentValue.toFixed(2)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={totalPnL >= 0 ? "profit" : "loss"}>
            ${totalPnL.toFixed(2)} ({pnlPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <VerticalGraph data={data} />
      </div>
    </>
  );
};

export default Holdings;
