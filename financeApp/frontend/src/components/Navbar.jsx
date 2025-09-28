import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/Login");

    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <span className="navbar-brand">Finance App</span>

            <div className="ms-auto d-flex align-items-center">
                {user && <span className="text-light me-3">👤 {user.full_name}</span>}
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;