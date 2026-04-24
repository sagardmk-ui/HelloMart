import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const savedPassword =
    localStorage.getItem("appPassword") || "admin";

  function handleLogin(e) {
    e.preventDefault();

    if (username === "admin" && password === savedPassword) {
      localStorage.setItem("loggedIn", "true");
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src={logo} alt="Brand logo" />
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">
          Access your inventory dashboard
        </p>

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className="login-field">
            <label>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label>Password</label>

            <div className="password-row">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>

        <button
          className="forgot-link"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}
``