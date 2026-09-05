import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AccessDenied() {
  const navigate = useNavigate();

  const {
    logout,
  } = useAuth();

  async function handleLogout() {
    const { success, error } =
      await logout();

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

        <p>
          SITE-19 // SECURITY SYSTEM
        </p>

        <h1>
          ACCESS DENIED
        </h1>

        <p>
          This personnel account is not
          authorized to access the requested
          Site-19 system.
        </p>

        <button
          type="button"
          onClick={handleLogout}
        >
          TERMINATE SESSION
        </button>

      </section>
    </main>
  );
}

export default AccessDenied;