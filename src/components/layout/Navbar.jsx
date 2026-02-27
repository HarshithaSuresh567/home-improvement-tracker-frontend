import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getMaintenanceTasks } from "../../api/projectApi.js";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "No due date");

const Navbar = ({ isPublic = false, onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const profileWrapRef = useRef(null);
  const alertsWrapRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileWrapRef.current?.contains(e.target)) setOpen(false);
      if (!alertsWrapRef.current?.contains(e.target)) setAlertOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onShortcut = (e) => {
      if (isPublic) return;
      const targetTag = String(e.target?.tagName || "").toLowerCase();
      const isTyping = targetTag === "input" || targetTag === "textarea";
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [isPublic]);

  const initials = useMemo(() => {
    const fromName =
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "User";
    return fromName.charAt(0).toUpperCase();
  }, [user]);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const goTo = (path) => {
    setOpen(false);
    setAlertOpen(false);
    navigate(path);
  };

  const loadAlerts = async () => {
    setAlertsLoading(true);
    const rows = (await getMaintenanceTasks()) || [];
    const pending = rows
      .filter((x) => String(x.status || "pending").toLowerCase() !== "completed")
      .sort((a, b) => {
        const ad = new Date(a.due_date || a.dueDate || "2100-01-01").getTime();
        const bd = new Date(b.due_date || b.dueDate || "2100-01-01").getTime();
        return ad - bd;
      })
      .slice(0, 6);
    setAlerts(pending);
    setAlertsLoading(false);
  };

  const toggleAlerts = async () => {
    const next = !alertOpen;
    setAlertOpen(next);
    setOpen(false);
    if (next) await loadAlerts();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    if (q.includes("project")) return navigate("/projects");
    if (q.includes("task") || q.includes("dashboard")) return navigate("/dashboard");
    if (q.includes("report") || q.includes("export")) return navigate("/reports");
    if (q.includes("inventory") || q.includes("tool") || q.includes("material")) return navigate("/inventory");
    if (q.includes("maint")) return navigate("/maintenance");
    if (q.includes("profile") || q.includes("account")) return navigate("/profile");
    if (q.includes("setting") || q.includes("theme")) return navigate("/settings");

    navigate("/projects");
  };

  if (isPublic) {
    return (
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            RenovaTrack
          </Link>

          <nav className="top-links">
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary btn-sm">
              Register
            </Link>
            <button type="button" className="btn-ghost btn-sm" onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="left-group">
          <button type="button" onClick={onMenuToggle} className="btn-ghost btn-sm menu-btn">
            Menu
          </button>
          <button type="button" onClick={() => navigate("/dashboard")} className="brand">
            RenovaTrack
          </button>
        </div>

        <form className="center-search" onSubmit={handleSearch}>
          <input
            ref={searchRef}
            className="input"
            placeholder="Search projects, tasks, reports, inventory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="right-group">
          <button type="button" className="btn-ghost btn-sm" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <div className="profile-wrap" ref={alertsWrapRef}>
            <button type="button" className="btn-ghost btn-sm" onClick={toggleAlerts}>
              🔔 Alerts {alerts.length ? `(${alerts.length})` : ""}
            </button>
            {alertOpen && (
              <div className="dropdown alerts-dropdown">
                <button type="button" onClick={() => goTo("/maintenance")}>
                  Open Maintenance
                </button>
                {alertsLoading ? (
                  <button type="button" disabled>Loading alerts...</button>
                ) : !alerts.length ? (
                  <button type="button" disabled>No pending alerts</button>
                ) : (
                  alerts.map((a) => (
                    <button key={a.id} type="button" onClick={() => goTo("/maintenance")}>
                      {a.title || "Maintenance task"} - {fmtDate(a.due_date || a.dueDate)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="profile-wrap" ref={profileWrapRef}>
            <button type="button" onClick={() => setOpen((prev) => !prev)} className="avatar">
              {initials}
            </button>
            {open && (
              <div className="dropdown">
                <button type="button" onClick={() => goTo("/profile")}>My Profile</button>
                <button type="button" onClick={() => goTo("/settings")}>Settings</button>
                <button type="button" onClick={() => window.print()}>
                  Export Data
                </button>
                <button type="button" className="danger" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
