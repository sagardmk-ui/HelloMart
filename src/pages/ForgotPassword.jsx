import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const savedAnswer =
    localStorage.getItem("securityAnswer") || "inventory";

  function checkAnswer(e) {
    e.preventDefault();

    if (answer.toLowerCase() === savedAnswer.toLowerCase()) {
      setStep(2);
      setError("");
    } else {
      setError("Incorrect answer");
    }
  }

  function resetPassword(e) {
    e.preventDefault();

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    localStorage.setItem("appPassword", newPassword);
    navigate("/login");
  }

  return (
    <div className="app" style={{ maxWidth: 420 }}>
      <h1>Reset Password</h1>

      {step === 1 && (
        <form onSubmit={checkAnswer}>
          <label className="subtle">
            Security Question:
          </label>
          <p><strong>What is this system for?</strong></p>

          <input
            placeholder="Your answer"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            autoFocus
          />

          {error && <div className="error">{error}</div>}

          <button className="pill-btn">Verify</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetPassword}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoFocus
          />

          {error && <div className="error">{error}</div>}

          <button className="pill-btn">
            Save New Password
          </button>
        </form>
      )}
    </div>
  );
}