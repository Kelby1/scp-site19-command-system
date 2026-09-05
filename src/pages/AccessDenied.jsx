import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AccessDenied() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    const { success } = await logout();

    if (success) {
      navigate("/login");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p>SITE-19 // SECURITY SYSTEM</p>

        <h1>ACCESS DENIED</h1>

        <p>
          This personnel account is not authorized to access Site-19 systems.
        </p>

        <button type="button" onClick={handleLogout}>
          TERMINATE SESSION
        </button>
      </section>
    </main>
  );
}

export default AccessDenied;