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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
      }}
    >
      <div
        style={{
          width: 360,
          padding: "28px 26px 24px",
          borderRadius: 18,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        <h2 style={{ marginBottom: 4 }}>Sign in</h2>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
          Use your test credentials to access the task manager.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label>Email</label>
            <input
              style={{ width: "100%", marginTop: 4 }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              style={{ width: "100%", marginTop: 4 }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p style={{ color: "#f97316", fontSize: 13, marginTop: 4 }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn" style={{ marginTop: 4 }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
