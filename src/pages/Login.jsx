import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { authService } from "../services/scp/auth/authService";
import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const navigate =
    useNavigate();

  const {
    isAuthenticated,
    isAuthLoading,
    profile,
    isProfileLoading,
    profileError,
  } = useAuth();

  /*
   * Every authenticated identity begins
   * a fresh Site-19 navigation session.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (
      isAuthLoading ||
      isProfileLoading
    ) {
      return;
    }

    if (
      profileError ||
      !profile
    ) {
      console.error(
        "[AUTH][POST LOGIN] PROFILE ERROR",
        profileError
      );

      navigate(
        "/access-denied",
        {
          replace: true,
        }
      );

      return;
    }

    if (
      profile.accountStatus ===
      "PENDING"
    ) {
      navigate(
        "/pending",
        {
          replace: true,
        }
      );

      return;
    }

    if (
      profile.accountStatus !==
      "ACTIVE"
    ) {
      navigate(
        "/access-denied",
        {
          replace: true,
        }
      );

      return;
    }

    navigate(
      "/",
      {
        replace: true,
      }
    );
  }, [
    isAuthenticated,
    isAuthLoading,
    isProfileLoading,
    profile,
    profileError,
    navigate,
  ]);

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage(
        "ALL FIELDS ARE REQUIRED."
      );

      return;
    }

    setIsSubmitting(true);

    const {
      error,
    } =
      await authService.signIn(
        email,
        password
      );

    if (error) {
      console.error(
        "[AUTH][LOGIN]",
        error
      );

      setErrorMessage(
        error.message ??
          "AUTHENTICATION FAILED. CHECK CREDENTIALS."
      );

      setIsSubmitting(false);

      return;
    }

    setSuccessMessage(
      "AUTHENTICATION SUCCESSFUL. VERIFYING PERSONNEL AUTHORIZATION..."
    );

    /*
     * AuthContext finishes loading
     * the correct personnel profile.
     *
     * Navigation is performed by
     * the useEffect above.
     */
  }

  const isVerifying =
    isSubmitting ||
    (
      isAuthenticated &&
      (
        isAuthLoading ||
        isProfileLoading
      )
    );

  return (
    <main className="auth-page">

      <section className="auth-panel">

        <header className="auth-panel__header">

          <p>
            SITE-19 // PERSONNEL LOGIN
          </p>

          <h1>
            TERMINAL AUTHENTICATION
          </h1>

          <div className="auth-panel__header-description">
            Authenticate Foundation
            credentials before accessing
            classified Site-19 systems.
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
            disabled={isVerifying}
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
            autoComplete="current-password"
            placeholder="ENTER PASSWORD"
            value={password}
            disabled={isVerifying}
            onChange={(event) =>
              setPassword(
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
            disabled={isVerifying}
          >
            {isVerifying
              ? "VERIFYING AUTHORIZATION..."
              : "AUTHENTICATE ACCESS"}
          </button>

        </form>

        <footer className="auth-panel__footer">

          <span>
            NEW PERSONNEL?
          </span>

          <Link to="/register">
            CREATE ACCOUNT REGISTRATION
          </Link>

        </footer>

      </section>

    </main>
  );
}

export default Login;