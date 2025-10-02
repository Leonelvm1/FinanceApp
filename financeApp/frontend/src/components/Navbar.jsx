import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <span className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
        Finance App
      </span>

      {user && (
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>🏠 Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/incomes" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>💰 Incomes</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/expenses" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>📉 Expenses</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>🗂 Categories</NavLink>
            </li>
          </ul>
        </div>
      )}

      <div className="ms-auto d-flex align-items-center">
        {user && <span className="text-light me-3">👤 {user.full_name}</span>}
        {user && <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;