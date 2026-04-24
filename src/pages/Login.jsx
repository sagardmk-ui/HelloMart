import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError("Invalid username or password");
        return;
      }

      // ✅ LOGIN SUCCESS
      localStorage.setItem("loggedIn", "true");
      navigate("/");
    } catch (err) {
      setError("Unable to connect to backend");
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
          {/* Email */}
          <div className="login-field">
            <label>Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
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