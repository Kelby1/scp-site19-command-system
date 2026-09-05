import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/scp/auth/authService";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password || !confirmPassword) {
      setErrorMessage("ALL FIELDS ARE REQUIRED.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("PASSWORD CONFIRMATION DOES NOT MATCH.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "PASSWORD MUST CONTAIN AT LEAST 8 CHARACTERS."
      );
      return;
    }

    setIsLoading(true);

    const { data, error } = await authService.signUp(
      email,
      password
    );

    if (error) {
      console.error("[AUTH][REGISTER]", error);
      setErrorMessage(
        error.message || "ACCOUNT REGISTRATION FAILED."
      );
    } else {
      console.log("[AUTH][REGISTER]", data);

      setSuccessMessage(
        "REGISTRATION RECEIVED. CHECK YOUR EMAIL FOR VERIFICATION."
      );

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel__header">
          <p>SITE-19 // PERSONNEL REGISTRATION</p>
          <h2>CREATE PERSONNEL ACCOUNT</h2>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">
            FOUNDATION EMAIL
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="personnel@example.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <label htmlFor="password">
            ACCESS PASSWORD
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="ENTER PASSWORD"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <label htmlFor="confirmPassword">
            CONFIRM PASSWORD
          </label>

          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="CONFIRM PASSWORD"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />

          {errorMessage && (
            <div className="auth-message auth-message--error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-message auth-message--success">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading
              ? "PROCESSING..."
              : "SUBMIT REGISTRATION"}
          </button>
        </form>

        <div className="auth-panel__footer">
          <span>ALREADY REGISTERED?</span>

          <Link to="/login">
            ACCESS LOGIN TERMINAL
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Register;