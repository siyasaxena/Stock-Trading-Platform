import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalChart.jsx";

// Standard practice: Use environment variables with local fallback
const API_BASE_URL = "http://localhost:8080";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Avoid state updates on unmounted component

    const fetchHoldingsWithLivePrices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch DB holdings
        const res = await axios.get(`${API_BASE_URL}/allHoldings`, {
          withCredentials: true,
        });

        const holdingsFromDb = res.data;

        if (Array.isArray(holdingsFromDb) && holdingsFromDb.length > 0) {
          // Fetch live prices in parallel
          const updatedHoldings = await Promise.all(
            holdingsFromDb.map(async (stock) => {
              try {
                const finnhubRes = await axios.get(
                  `${API_BASE_URL}/api/stock/${stock.name}`,
                  { withCredentials: true },
                );

                const liveData = finnhubRes.data;

                return {
                  ...stock,
                  price: liveData?.currentPrice ?? stock.price,
                  day: liveData?.percentChange
                    ? `${liveData.percentChange.toFixed(2)}%`
                    : stock.day,
                  isLoss: (liveData?.change ?? 0) < 0,
                };
              } catch (err) {
                console.warn(
                  `Could not fetch price for ${stock.name}:`,
                  err.message,
                );
                return stock; // Fallback to DB stock data on single request failure
              }
            }),
          );

          if (isMounted) setAllHoldings(updatedHoldings);
        } else {
          if (isMounted) setAllHoldings([]);
        }
      } catch (err) {
        console.error("Failed to load holdings:", err);
        if (isMounted) setError("Failed to load holdings data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHoldingsWithLivePrices();

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, []);

  // --- Derived Calculations (Memoized for Performance) ---
  const { totalInvestment, currentValue, totalPnL, pnlPercent, chartData } =
    useMemo(() => {
      const investment = allHoldings.reduce(
        (acc, s) => acc + (Number(s.avg) || 0) * (Number(s.qty) || 0),
        0,
      );
      const current = allHoldings.reduce(
        (acc, s) => acc + (Number(s.price) || 0) * (Number(s.qty) || 0),
        0,
      );
      const pnl = current - investment;
      const pct = investment > 0 ? (pnl / investment) * 100 : 0;

      const chart = {
        labels: allHoldings.map((s) => s.name),
        datasets: [
          {
            label: "Live Market Price",
            data: allHoldings.map((s) => Number(s.price) || 0),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      };

      return {
        totalInvestment: investment,
        currentValue: current,
        totalPnL: pnl,
        pnlPercent: pct,
        chartData: chart,
      };
    }, [allHoldings]);

  if (loading)
    return <div className="loading">Fetching Live Finnhub Market Data...</div>;
  if (error) return <div className="error">{error}</div>;

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

                return (
                  <tr key={stock._id || stock.name || index}>
                    <td>
                      <strong>{stock.name}</strong>
                    </td>
                    <td>{qty}</td>
                    <td>${avg.toFixed(2)}</td>
                    <td>
                      <strong>${price.toFixed(2)}</strong>
                    </td>
                    <td>${currValue.toFixed(2)}</td>
                    <td className={isProfit ? "profit" : "loss"}>
                      ${pnl.toFixed(2)}
                    </td>
                    <td className={stock.isLoss ? "loss" : "profit"}>
                      {stock.day}
                    </td>
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
        <VerticalGraph data={chartData} />
      </div>
    </>
  );
};

export default Holdings;
