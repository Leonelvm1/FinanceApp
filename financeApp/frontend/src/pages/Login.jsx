// src/pages/Login.jsx
/**
 * Login page
 *
 * Purpose:
 *  - Simple sign-in form that calls AuthContext.login(username, password).
 *  - On success the app expects the server to set an HttpOnly cookie and refreshUser() will load the user.
 *
 * Notes:
 *  - Uses form-encoded POST to support OAuth2PasswordRequestForm on the backend.
 *  - Displays a compact error box when credentials fail.
 */

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("[Login] Error:", err);
      setError("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="card-body">
          <h3 className="mb-3">Sign in</h3>
          <p className="text-muted mb-3">Welcome back — please sign in to continue.</p>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <button
                type="button"
                className="btn btn-link"
                onClick={() => navigate("/signup")}
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
