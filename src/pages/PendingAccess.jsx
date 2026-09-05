import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PendingAccess() {
  const navigate = useNavigate();

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

          <p>
            SITE-19 // PERSONNEL AUTHORIZATION
          </p>

          <h1>
            VERIFYING PERSONNEL STATUS...
          </h1>

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
    profile.accountStatus ===
    "SUSPENDED"
  ) {
    return (
      <Navigate
        to="/access-denied"
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
    const { success, error } =
      await logout();

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

        <p>
          SITE-19 // PERSONNEL AUTHORIZATION
        </p>

        <h1>
          ACCESS PENDING
        </h1>

        <p>
          Personnel identity has been verified,
          but Site-19 authorization has not yet
          been approved.
        </p>

        <p>
          PERSONNEL: {profile.displayName}
        </p>

        <p>
          ROLE: {profile.role}
        </p>

        <p>
          CLEARANCE LEVEL:{" "}
          {profile.clearanceLevel}
        </p>

        <p>
          STATUS:{" "}
          {profile.accountStatus}
        </p>

        <button
          type="button"
          onClick={handleLogout}
        >
          LOGOUT
        </button>

      </section>
    </main>
  );
}

export default PendingAccess;