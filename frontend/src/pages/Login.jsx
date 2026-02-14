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
/**
 * Login page (refactored)
 * - Card has mini-bounce animation.
 * - Uses toast for feedback.
 */

// src/pages/Login.jsx
// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import PasswordInput from "../components/PasswordInput";

const Login = () => {
  const { login } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      showToast({
        type: "success",
        title: "Signed in",
        message: `Welcome back, ${username}!`,
        duration: 3500,
        closable: true,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("[Login] Error:", err);
      const msg =
        err?.response?.data?.detail || "Invalid credentials or server error.";
      showToast({
        type: "error",
        title: "Login failed",
        message: String(msg),
        duration: 7000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center py-5">
      <div className="card shadow-sm p-4" style={{ width: 520 }}>
        <div className="card-body">
          <h3 className="mb-3">Sign in</h3>
          <p className="text-muted mb-3">
            Welcome back — please sign in to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Your username (same as registration)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required={true}
              autoComplete="current-password"
            />

            <div className="d-flex justify-content-between align-items-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
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
