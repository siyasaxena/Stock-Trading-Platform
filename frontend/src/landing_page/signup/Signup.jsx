import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://stock-trading-backend-jut8.onrender.com/api/auth/register",
        formData,
      );

      // Extract username from response or fallback to form input
      const registeredUsername =
        response.data.user?.username || formData.username;

      // Save locally on frontend origin
      localStorage.setItem("username", registeredUsername);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setSuccess("Account created successfully! Redirecting...");

      // Redirect user to dashboard after 1.5 seconds, passing username in URL query string
      setTimeout(() => {
        const dashboardUrl = `https://stock-trading-dashboard-qdnt.onrender.com?username=${encodeURIComponent(
          registeredUsername,
        )}`;

        window.location.href = dashboardUrl;
      }, 1500);
    } catch (e) {
      setError(
        e.response?.data?.message || "Failed to register. Please try again.",
      );
    }
  };

  return (
    <div className="container p-5 mb-5" style={{ maxWidth: "450px" }}>
      <div className="text-center mb-4">
        <h2>Open a trading account</h2>
        <p className="text-muted">Sign up to get started with trading</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2 mt-2">
          Sign Up
        </button>
      </form>

      <div className="text-center mt-3">
        <small className="text-muted">
          Already have an account? <Link to="/login">Log in here</Link>
        </small>
      </div>
    </div>
  );
}

export default Signup;
