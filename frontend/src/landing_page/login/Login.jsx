import { useState } from "react";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
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
        "http://localhost:8080/api/auth/login",
        formData,
        { withCredentials: true },
      );

      const username =
        response.data.user?.username ||
        response.data.username ||
        formData.email.split("@")[0];
      const email = response.data.user?.email || formData.email;

      localStorage.setItem("username", username);
      localStorage.setItem("email", email);

      // Save token if your register endpoint returns one
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setSuccess("Logged in successfully! Redirecting...");

      // Redirect user to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = `http://localhost:5174?username=${encodeURIComponent(username)}`;
      }, 1500);
    } catch (e) {
      setError(
        e.response?.data?.message || "Invalid credentials. Please try again.",
      );
    }
  };

  return (
    <div className="container p-5 mb-5" style={{ maxWidth: "450px" }}>
      <div className="text-center mb-4">
        <h2>Login Portal</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
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
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
