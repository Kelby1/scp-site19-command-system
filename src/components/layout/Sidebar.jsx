import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  { label: "COMMAND CENTER", path: "/" },
  { label: "SCP DATABASE", path: "/database" },
  { label: "PERSONNEL", path: "/personnel" },
  { label: "FACILITIES", path: "/facilities" },
  { label: "INCIDENTS", path: "/incidents" },
  { label: "SYSTEM TERMINAL", path: "/terminal" },
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
    const { success } = await logout();

    if (success) {
      navigate("/login", {
        replace: true,

        /*
         * Tell Login.jsx:
         *
         * This is an intentional logout.
         * Do NOT restore the previous user's page.
         */
        state: {
          freshLogin: true,
        },
      });
    }
  }

  return (
    <aside className="sidebar">
      <p className="sidebar__title">
        SITE-19 // NAVIGATION
      </p>

      <nav>
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__item ${
                isActive ? "sidebar__item--active" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}

        {profile?.role === "ADMIN" &&
          profile?.accountStatus === "ACTIVE" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar__item ${
                  isActive ? "sidebar__item--active" : ""
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
                  {profile?.displayName}
                </span>

                <strong>
                  ROLE: {profile?.role}
                </strong>

                <strong>
                  CLEARANCE LEVEL:{" "}
                  {profile?.clearanceLevel}
                </strong>

                <span>
                  STATUS:{" "}
                  {profile?.accountStatus}
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
              navigate("/login", {
                state: {
                  freshLogin: true,
                },
              })
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