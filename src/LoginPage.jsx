// src/LoginPage.jsx
import React, { useState } from "react";

const API_BASE = "http://localhost:8081";

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("test@hahn.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid credentials");
        return;
      }

      const data = await res.json();
      const token = data.token;
      localStorage.setItem("authToken", token);
      onLoginSuccess(token);
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-dot" />
            <span className="logo-text">Hahn Task Manager</span>
          </div>
          <p className="auth-subtitle">
            Use the test credentials provided in the assignment to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn auth-btn">
            Sign in
          </button>
        </form>

        <p className="auth-footer-note">
          This demo is for the Hahn internship task. No real data is stored.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
