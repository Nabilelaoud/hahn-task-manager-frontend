import React, { useState } from "react";
import "./App.css";
import ProjectsPage from "./ProjectsPage";
import LoginPage from "./LoginPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  const handleLoginSuccess = (t) => {
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">Task Manager</div>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="app-main">
        <ProjectsPage />
      </main>
    </div>
  );
}

export default App;
