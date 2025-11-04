// src/components/Navbar.jsx
/**
 * Navbar
 *
 * Renders navigation links when user is authenticated.
 * - Shows username and logout button on the right.
 * - Uses react-router NavLink for active styling.
 *
 * Notes:
 *  - Clicking brand navigates to /dashboard.
 *  - For responsive navbar toggling, Bootstrap classes are present.
 */

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
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar px-3">
      <span 
        className="navbar-brand" 
        style={{ cursor: "pointer" }} 
        onClick={() => navigate("/dashboard")}
      >
        💰 Finance App
      </span>

      {/* Mobile toggler */}
      <button 
        className="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarContent"
        aria-controls="navbarContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarContent">
        {user && (
          <>
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  🏠 Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/incomes" 
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  💰 Incomes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/expenses" 
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  📉 Expenses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/categories" 
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  🗂 Categories
                </NavLink>
              </li>
            </ul>

            <div className="navbar-nav ms-auto d-flex align-items-center">
              <span className="nav-link text-light me-3">👤 {user.full_name}</span>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-light btn-sm"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
