// src/pages/Signup.jsx
/**
 * Signup page
 *
 * Purpose:
 *  - Collect user data and create an account by calling AuthContext.signup(data).
 *  - Enforces client-side password rules via validatePassword helper.
 *
 * Data contract:
 *  - Submits JSON matching the backend UserDTOPetition fields:
 *    { full_name, birth_date, location, savings_goal, password }
 *
 * Notes:
 *  - After successful signup the user is asked to sign in (redirect to /login).
 */

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { validatePassword } from "../utils/validatePassword";

const Signup = () => {
  const { signup, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    location: "",
    savings_goal: 0,
    password: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pw = validatePassword(form.password);
  const passwordsMatch = form.password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!pw.valid) {
      setErrorMsg("Please choose a stronger password according to the rules.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match. Please confirm your password.");
      return;
    }

    setLoading(true);
    try {
      // Backend expects JSON body with fields defined in UserDTOPetition
      await signup(form);
      alert("Account created. Please sign in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      const msg = err?.response?.data?.detail || "Failed to create account.";
      setErrorMsg(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="card shadow-sm p-4" style={{ width: 520 }}>
        <h3 className="mb-3">Create an account</h3>

        {errorMsg && (
          <div className="alert alert-danger" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full name</label>
              <input
                name="full_name"
                className="form-control"
                value={form.full_name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Birth date</label>
              <input
                name="birth_date"
                type="date"
                className="form-control"
                value={form.birth_date}
                onChange={handleChange}
                required
                autoComplete="bday"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Location</label>
              <input
                name="location"
                className="form-control"
                value={form.location}
                onChange={handleChange}
                required
                autoComplete="address-level2"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Savings goal</label>
              <input
                name="savings_goal"
                type="number"
                className="form-control"
                value={form.savings_goal}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
              aria-describedby="passwordHelp"
              autoComplete="new-password"
            />
            <small id="passwordHelp" className="form-text text-muted">
              Password must be at least 8 characters and include uppercase, lowercase, number & symbol.
            </small>

            <div className="mt-2">
              <ul className="list-unstyled mb-0" style={{ fontSize: 14 }}>
                <li style={{ color: pw.reasons.length ? "green" : "#a0a0a0" }}>• Minimum 8 characters</li>
                <li style={{ color: pw.reasons.hasUpper ? "green" : "#a0a0a0" }}>• Uppercase letter</li>
                <li style={{ color: pw.reasons.hasLower ? "green" : "#a0a0a0" }}>• Lowercase letter</li>
                <li style={{ color: pw.reasons.hasNumber ? "green" : "#a0a0a0" }}>• Number</li>
                <li style={{ color: pw.reasons.hasSymbol ? "green" : "#a0a0a0" }}>• Symbol (e.g. !@#$%)</li>
              </ul>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <small className="text-danger">Passwords do not match.</small>
            )}
          </div>

          <button className="btn btn-success w-100" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <small className="text-muted">
            Already have an account? <a href="/login">Sign in</a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Signup;
