import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { authService } from "../services/scp/auth/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    isAuthLoading,
    profile,
    isProfileLoading,
    profileError,
  } = useAuth();

  

  

  /*
   * IMPORTANT:
   *
   * Navigation happens only after
   * AuthContext has loaded the real
   * personnel profile.
   *
   * No arbitrary setTimeout().
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

    if (profileError || !profile) {
      navigate(
        "/access-denied",
        { replace: true }
      );

      return;
    }

    if (
      profile.accountStatus ===
      "PENDING"
    ) {
      navigate(
        "/pending",
        { replace: true }
      );

      return;
    }

    if (
      profile.accountStatus ===
      "SUSPENDED"
    ) {
      navigate(
        "/access-denied",
        { replace: true }
      );

      return;
    }

    if (
      profile.accountStatus !==
      "ACTIVE"
    ) {
      navigate(
        "/access-denied",
        { replace: true }
      );

      return;
    }


    const destination =
      location.state?.freshLogin
        ? "/"
        : location.state?.from?.pathname || "/";

    console.log(
      "[AUTH][POST LOGIN REDIRECT]",
      {
        destination,
        role: profile.role,
        status: profile.accountStatus,
        clearance: profile.clearanceLevel,
      }
    );

    navigate(destination, {
      replace: true,
    });
  }, [
    isAuthenticated,
    isAuthLoading,
    isProfileLoading,
    profile,
    profileError,
    navigate,
    location.state,
  ]);

  async function handleSubmit(event) {
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

    const { data, error } =
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
        error.message ||
          "AUTHENTICATION FAILED. CHECK CREDENTIALS."
      );

      setIsSubmitting(false);

      return;
    }

    console.log(
      "[AUTH][LOGIN]",
      data
    );

    setSuccessMessage(
      "AUTHENTICATION SUCCESSFUL. VERIFYING PERSONNEL AUTHORIZATION..."
    );

    /*
     * DO NOT navigate here.
     *
     * AuthContext will receive the new
     * Supabase session and load the
     * corresponding profile.
     *
     * The useEffect above performs
     * navigation only after that
     * process finishes.
     */
    setIsSubmitting(false);
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">

        <div className="auth-panel__header">
          <p>
            SITE-19 // PERSONNEL LOGIN
          </p>

          <h2>
            TERMINAL AUTHENTICATION
          </h2>
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={
              isSubmitting ||
              isAuthLoading ||
              isProfileLoading
            }
          >
            {isSubmitting
              ? "AUTHENTICATING..."
              : "AUTHENTICATE ACCESS"}
          </button>
        </form>

        <div className="auth-panel__footer">
          <span>
            NEW PERSONNEL?
          </span>

          <Link to="/register">
            CREATE ACCOUNT REGISTRATION
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Login;