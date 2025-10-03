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

      {/* Botón toggler para móvil - ESENCIAL PARA RESPONSIVE */}
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

      {/* Contenido colapsable - TODO VA DENTRO DE ESTE DIV */}
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