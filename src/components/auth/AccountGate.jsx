import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AccountGate({ children }) {
  const {
    profile,
    isProfileLoading,
    profileError,
  } = useAuth();

  if (isProfileLoading) {
    return (
      <section className="auth-loading">
        <p>SITE-19 // PERSONNEL CONTROL</p>
        <h2>VERIFYING ACCOUNT STATUS...</h2>
      </section>
    );
  }

  if (profileError || !profile) {
    return <Navigate to="/access-denied" replace />;
  }

  if (profile.accountStatus === "PENDING") {
    return <Navigate to="/pending" replace />;
  }

  if (profile.accountStatus === "SUSPENDED") {
    return <Navigate to="/access-denied" replace />;
  }

  if (profile.accountStatus !== "ACTIVE") {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default AccountGate;