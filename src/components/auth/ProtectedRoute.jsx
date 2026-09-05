import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  if (isAuthLoading) {
    return (
      <section className="auth-loading">
        <p>
          SITE-19 // SECURITY SYSTEM
        </p>

        <h2>
          VERIFYING PERSONNEL CREDENTIALS...
        </h2>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;