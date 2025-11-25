import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      alert("Please select a role before logging in.");
      return;
    }

    setLoading(true);

    try {
      // Call backend login API
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const { token, user } = response.data;

      // Save JWT token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", formData.role);
      localStorage.setItem("userId", user._id || ""); // optional if your backend sends it

      alert("Login Successful!");

      // Navigate based on role
      if (formData.role === "seller") navigate("/dashboard");
      else if (formData.role === "customer") navigate("/customer-dashboard");
    } catch (err) {
      console.error("Login error:", err.response || err);
      alert(
        err.response?.data?.msg || "Login failed. Please check your email/password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('home.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: "40px",
          borderRadius: "16px",
          width: "380px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#333", fontSize: "32px" }}>
          <span style={{ color: "#4A90E2" }}>Trust</span>Hub
        </h1>
        <h3 style={{ marginBottom: "25px", color: "#666" }}>Welcome Back</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select Role</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </select>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "15px" }}>
          Don’t have an account?{" "}
          <a href="/register" style={{ color: "#4A90E2", textDecoration: "none" }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#4A90E2",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default Login;
