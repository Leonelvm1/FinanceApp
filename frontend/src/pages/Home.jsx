// src/pages/Home.jsx
/**
 * Home page (landing)
 *
 * Purpose:
 *  - Simple landing page offering "Create account" (signup) and "Sign in".
 *  - If there's a legacy token in localStorage it redirects to /dashboard automatically.
 *
 * Notes:
 *  - UI is responsive. On small screens the right illustration is hidden.
 */

// src/pages/Home.jsx
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logoFinanceApp.png";

const Home = () => {
  // Use server-validated `user` (cookie-based) and `loading` from AuthContext
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user exists (session via cookie validated) -> go dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // While we are trying to rehydrate the session, show a neutral loader to avoid flicker
  if (loading) {
    return (
      <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border" role="status" aria-hidden="true" />
          <div className="mt-2">Checking session...</div>
        </div>
      </div>
    );
  }

  // Normal landing page (for non-authenticated users)
  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: 880, width: "95%" }}
      >
        <div className="row g-0">
          <div className="col-md-6 d-flex flex-column justify-content-center p-4">
            <h1 className="display-6">Finance App</h1>
            <p className="text-muted mb-4">
              Track your incomes, expenses and reach your savings goals. Clean,
              simple and built for demos.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/signup")}
              >
                Create account
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </div>
          </div>

          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-4">
            <div style={{ textAlign: "center" }}>
              <img
                src={logo}
                alt="FinanceApp logo"
                className="img-fluid"
                style={{ maxHeight: 140, opacity: 0.9 }}
              />
              <p className="mt-3 text-muted small">Demo project</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

