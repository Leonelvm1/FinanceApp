// src/pages/Home.jsx
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: 880, width: "95%" }}>
        <div className="row g-0">
          <div className="col-md-6 d-flex flex-column justify-content-center p-4">
            <h1 className="display-6">Finance App</h1>
            <p className="text-muted mb-4">
              Track your incomes, expenses and reach your savings goals. Clean, simple and built for demos.
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={() => navigate("/signup")}>
                Create account
              </button>
              <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>

          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-4">
            <div style={{ textAlign: "center" }}>
              <img
                src="/logo192.png"
                alt="logo"
                className="img-fluid"
                style={{ maxHeight: 140, opacity: 0.9 }}
              />
              <p className="mt-3 text-muted small">Demo project — fullstack showcase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
