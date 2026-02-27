import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";
import Layout from "../components/layout/Layout.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Home from "../pages/Home.jsx";
import NotFound from "../pages/NotFound.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Projects from "../pages/Projects.jsx";
import ProjectDetails from "../pages/ProjectDetails.jsx";
import Maintenance from "../pages/Maintenance.jsx";
import Reports from "../pages/Reports.jsx";
import Inventory from "../pages/Inventory.jsx";
import Profile from "../pages/Profile.jsx";
import Settings from "../pages/Settings.jsx";

const PublicShell = ({ children }) => (
  <div className="public-shell">
    <Navbar isPublic />
    <div className="public-content">{children}</div>
  </div>
);

const PrivateShell = ({ children }) => (
  <PrivateRoute>
    <Layout>{children}</Layout>
  </PrivateRoute>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const content = document.querySelector(".content");
    if (content) content.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<PublicShell><Home /></PublicShell>} />
      <Route path="/login" element={<PublicShell><Login /></PublicShell>} />
      <Route path="/register" element={<PublicShell><Register /></PublicShell>} />

      <Route path="/dashboard" element={<PrivateShell><Dashboard /></PrivateShell>} />
      <Route path="/projects" element={<PrivateShell><Projects /></PrivateShell>} />
      <Route path="/projects/:id" element={<PrivateShell><ProjectDetails /></PrivateShell>} />
      <Route path="/inventory" element={<PrivateShell><Inventory /></PrivateShell>} />
      <Route path="/maintenance" element={<PrivateShell><Maintenance /></PrivateShell>} />
      <Route path="/reports" element={<PrivateShell><Reports /></PrivateShell>} />
      <Route path="/profile" element={<PrivateShell><Profile /></PrivateShell>} />
      <Route path="/settings" element={<PrivateShell><Settings /></PrivateShell>} />

      <Route path="*" element={<PublicShell><NotFound /></PublicShell>} />
    </Routes>
  </>
);

export default AppRoutes;
