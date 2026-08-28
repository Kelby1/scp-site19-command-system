import { NavLink } from "react-router-dom";

const navigationItems = [
{ label: "COMMAND CENTER", path: "/" },
{ label: "SCP DATABASE", path: "/database" },
{ label: "PERSONNEL", path: "/personnel" },
{ label: "FACILITIES", path: "/facilities" },
{ label: "INCIDENTS", path: "/incidents" },
{ label: "SYSTEM TERMINAL", path: "/terminal" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar__title">SITE-19 // NAVIGATION</p>

      <nav>
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span>CLEARANCE LEVEL</span>
        <strong>LEVEL 4</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
