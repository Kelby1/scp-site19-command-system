import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { authService } from "../services/scp/auth/authService";
import { isSupabaseConfigured } from "../lib/supabase";

import "../styles/auth.css";

function Register() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage(
        "ALL FIELDS ARE REQUIRED."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "PASSWORD CONFIRMATION DOES NOT MATCH."
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setErrorMessage(
        "PASSWORD MUST CONTAIN AT LEAST 8 CHARACTERS."
      );

      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "DATABASE NOT CONFIGURED: Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, then restart npm run dev."
      );
      return;
    }

    setIsLoading(true);

    const {
      error,
    } =
      await authService.signUp(
        email,
        password
      );

    if (error) {
      console.error(
        "[AUTH][REGISTER]",
        error
      );

      const isFetchError =
        error.message?.includes("Failed to fetch") ||
        error.name === "AuthRetryableFetchError";

      setErrorMessage(
        isFetchError
          ? "CONNECTION FAILED: Unable to reach the Supabase backend. Please verify your VITE_SUPABASE_URL in .env."
          : (error.message ?? "ACCOUNT REGISTRATION FAILED.")
      );

      setIsLoading(false);

      return;
    }

    setSuccessMessage(
      "REGISTRATION RECEIVED. CHECK YOUR EMAIL FOR VERIFICATION."
    );

    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setIsLoading(false);
  }

  return (
    <main className="auth-page">

      <section className="auth-panel">

        <header className="auth-panel__header">

          <p>
            SITE-19 // PERSONNEL REGISTRATION
          </p>

          <h1>
            CREATE PERSONNEL ACCOUNT
          </h1>

          <div className="auth-panel__header-description">
            New identities enter Site-19
            with restricted authorization
            until reviewed by an active
            administrator.
          </div>

        </header>

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
            disabled={isLoading}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
          />

          <label htmlFor="password">
            ACCESS PASSWORD
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="MINIMUM 8 CHARACTERS"
            value={password}
            disabled={isLoading}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
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
            disabled={isLoading}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
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
              ? "PROCESSING REGISTRATION..."
              : "SUBMIT REGISTRATION"}
          </button>

        </form>

        <footer className="auth-panel__footer">

          <span>
            ALREADY REGISTERED?
          </span>

          <Link to="/login">
            ACCESS LOGIN TERMINAL
          </Link>

        </footer>

      </section>

    </main>
  );
}

export default Register;