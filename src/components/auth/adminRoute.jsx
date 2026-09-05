import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminRoute({ children }) {
  const {
    profile,
    isAuthLoading,
    isProfileLoading,
    profileError,
  } = useAuth();

  // Wait for BOTH authentication and personnel profile
  if (isAuthLoading || isProfileLoading) {
    return (
      <section className="auth-loading">
        <p>SITE-19 // ADMINISTRATION</p>
        <h2>VERIFYING ADMIN CREDENTIALS...</h2>
      </section>
    );
  }

  if (profileError || !profile) {
    console.error("[ADMIN ROUTE] PROFILE ERROR", {
      profile,
      profileError,
    });

    return <Navigate to="/access-denied" replace />;
  }

  const isAdmin =
    profile.role === "ADMIN" &&
    profile.accountStatus === "ACTIVE";

  console.log("[ADMIN ROUTE]", {
    role: profile.role,
    status: profile.accountStatus,
    clearance: profile.clearanceLevel,
    isAdmin,
  });

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default AdminRoute;