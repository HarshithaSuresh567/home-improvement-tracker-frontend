import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onMenuToggle={() => setOpen((v) => !v)} />
      <div className="shell-body">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
