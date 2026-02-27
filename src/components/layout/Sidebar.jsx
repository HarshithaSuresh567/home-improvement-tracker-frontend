import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) => `side-link ${isActive ? "active" : ""}`;

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      <div className={`backdrop ${open ? "show" : ""}`} onClick={onClose} />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <nav>
          <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/projects" className={linkClass} onClick={onClose}>
            📁 Projects
          </NavLink>
          <NavLink to="/reports" className={linkClass} onClick={onClose}>
            📊 Reports
          </NavLink>
          <NavLink to="/inventory" className={linkClass} onClick={onClose}>
            🧰 Inventory
          </NavLink>
          <NavLink to="/maintenance" className={linkClass} onClick={onClose}>
            🗓️ Maintenance
          </NavLink>
          <NavLink to="/profile" className={linkClass} onClick={onClose}>
            👤 My Profile
          </NavLink>
          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            ⚙️ Settings
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
