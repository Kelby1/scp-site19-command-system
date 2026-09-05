import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  {
    label: "COMMAND CENTER",
    path: "/",
  },
  {
    label: "SCP DATABASE",
    path: "/database",
  },
  {
    label: "PERSONNEL",
    path: "/personnel",
  },
  {
    label: "FACILITIES",
    path: "/facilities",
  },
  {
    label: "INCIDENTS",
    path: "/incidents",
  },
  {
    label: "SYSTEM TERMINAL",
    path: "/terminal",
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const {
    user,
    profile,
    isAuthenticated,
    isAuthLoading,
    isProfileLoading,
    logout,
  } = useAuth();

  async function handleLogout() {
    const { success, error } =
      await logout();

    if (!success) {
      console.error(
        "[SIDEBAR][LOGOUT]",
        error
      );

      return;
    }

    /*
     * Explicitly end navigation context
     * for the current user.
     */
    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }

  return (
    <aside className="sidebar">

      <p className="sidebar__title">
        SITE-19 // NAVIGATION
      </p>

      <nav>
        {navigationItems.map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({
                isActive,
              }) =>
                `sidebar__item ${
                  isActive
                    ? "sidebar__item--active"
                    : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          )
        )}

        {profile?.role === "ADMIN" &&
          profile?.accountStatus ===
            "ACTIVE" && (
            <NavLink
              to="/admin"
              className={({
                isActive,
              }) =>
                `sidebar__item ${
                  isActive
                    ? "sidebar__item--active"
                    : ""
                }`
              }
            >
              ADMIN CONTROL
            </NavLink>
          )}
      </nav>

      <div className="sidebar__footer">

        {isAuthenticated && (
          <>
            {isProfileLoading ? (
              <span>
                LOADING PERSONNEL FILE...
              </span>
            ) : (
              <>
                <span>
                  {profile?.displayName ??
                    "UNKNOWN PERSONNEL"}
                </span>

                <strong>
                  ROLE:{" "}
                  {profile?.role ??
                    "UNASSIGNED"}
                </strong>

                <strong>
                  CLEARANCE LEVEL:{" "}
                  {profile?.clearanceLevel ??
                    0}
                </strong>

                <span>
                  STATUS:{" "}
                  {profile?.accountStatus ??
                    "UNKNOWN"}
                </span>
              </>
            )}
          </>
        )}

      </div>

      <div className="sidebar-auth">

        {isAuthLoading ? (
          <span>
            VERIFYING SESSION...
          </span>
        ) : isAuthenticated ? (
          <>
            <div className="sidebar-auth__user">

              <span>
                AUTHENTICATED
              </span>

              <small>
                {user?.email}
              </small>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-auth__button"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate(
                "/login",
                {
                  replace: true,
                }
              )
            }
            className="sidebar-auth__button"
          >
            LOGIN
          </button>
        )}

      </div>

    </aside>
  );
}

export default Sidebar;