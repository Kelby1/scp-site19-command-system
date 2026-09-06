import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

function PendingAccess() {
  const navigate =
    useNavigate();

  const {
    profile,
    isProfileLoading,
    profileError,
    logout,
  } = useAuth();

  if (isProfileLoading) {
    return (
      <main className="auth-page">

        <section className="auth-panel">

          <header className="auth-panel__header">

            <p>
              SITE-19 // PERSONNEL AUTHORIZATION
            </p>

            <h1>
              VERIFYING PERSONNEL STATUS
            </h1>

          </header>

          <div className="auth-status">

            <div className="auth-status__notice">
              Retrieving personnel
              authorization record...
            </div>

          </div>

        </section>

      </main>
    );
  }

  if (
    profileError ||
    !profile
  ) {
    return (
      <Navigate
        to="/access-denied"
        replace
      />
    );
  }

  if (
    profile.accountStatus ===
    "ACTIVE"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    profile.accountStatus !==
    "PENDING"
  ) {
    return (
      <Navigate
        to="/access-denied"
        replace
      />
    );
  }

  async function handleLogout() {
    const {
      success,
      error,
    } = await logout();

    if (!success) {
      console.error(
        "[PENDING ACCESS][LOGOUT]",
        error
      );

      return;
    }

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }

  return (
    <main className="auth-page">

      <section className="auth-panel">

        <header className="auth-panel__header">

          <p>
            SITE-19 // PERSONNEL AUTHORIZATION
          </p>

          <h1>
            ACCESS PENDING
          </h1>

          <div className="auth-panel__header-description">
            Identity verification
            succeeded. Site-19 access
            requires administrator
            authorization.
          </div>

        </header>

        <div className="auth-status">

          <div className="auth-status__indicator auth-status__indicator--pending">
            ⧗
          </div>

          <div className="auth-status__notice auth-status__notice--pending">

            <strong>
              AUTHORIZATION REVIEW REQUIRED
            </strong>

            Your account exists, but
            classified systems remain
            inaccessible until an active
            administrator approves the
            personnel record.

          </div>

          <div className="auth-status__profile">

            <div>
              <span>
                PERSONNEL
              </span>

              <strong>
                {profile.displayName}
              </strong>
            </div>

            <div>
              <span>
                ROLE
              </span>

              <strong>
                {profile.role}
              </strong>
            </div>

            <div>
              <span>
                CLEARANCE
              </span>

              <strong>
                LEVEL{" "}
                {profile.clearanceLevel}
              </strong>
            </div>

            <div>
              <span>
                STATUS
              </span>

              <strong>
                {profile.accountStatus}
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="auth-security-button"
            onClick={handleLogout}
          >
            TERMINATE SESSION
          </button>

        </div>

      </section>

    </main>
  );
}

export default PendingAccess;