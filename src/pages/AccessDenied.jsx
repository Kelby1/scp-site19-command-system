import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

function AccessDenied() {
  const navigate =
    useNavigate();

  const {
    profile,
    logout,
  } = useAuth();

  async function handleLogout() {
    const {
      success,
      error,
    } = await logout();

    if (!success) {
      console.error(
        "[ACCESS DENIED][LOGOUT]",
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
            SITE-19 // SECURITY SYSTEM
          </p>

          <h1>
            ACCESS DENIED
          </h1>

          <div className="auth-panel__header-description">
            The active personnel identity
            does not satisfy the
            authorization requirements
            for this Site-19 resource.
          </div>

        </header>

        <div className="auth-status">

          <div className="auth-status__indicator auth-status__indicator--denied">
            ⚠
          </div>

          <div className="auth-status__notice auth-status__notice--denied">

            <strong>
              SECURITY RESTRICTION
            </strong>

            This request has been rejected.
            No classified information has
            been released.

          </div>

          {profile && (
            <div className="auth-status__profile">

              <div>
                <span>
                  PERSONNEL
                </span>

                <strong>
                  {profile.displayName ??
                    "UNKNOWN PERSONNEL"}
                </strong>
              </div>

              <div>
                <span>
                  ROLE
                </span>

                <strong>
                  {profile.role ??
                    "UNASSIGNED"}
                </strong>
              </div>

              <div>
                <span>
                  CLEARANCE
                </span>

                <strong>
                  LEVEL{" "}
                  {profile.clearanceLevel ??
                    0}
                </strong>
              </div>

              <div>
                <span>
                  ACCOUNT STATUS
                </span>

                <strong>
                  {profile.accountStatus ??
                    "UNKNOWN"}
                </strong>
              </div>

            </div>
          )}

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

export default AccessDenied;