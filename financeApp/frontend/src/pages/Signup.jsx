// src/pages/Signup.jsx
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pw = validatePassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pw.valid) {
      alert("Please choose a stronger password according to the rules below.");
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      alert("Account created. Please sign in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="card shadow-sm p-4" style={{ width: 520 }}>
        <h3 className="mb-3">Create an account</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full name</label>
              <input name="full_name" className="form-control" onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Birth date</label>
              <input name="birth_date" type="date" className="form-control" onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Location</label>
              <input name="location" className="form-control" onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Savings goal</label>
              <input name="savings_goal" type="number" className="form-control" onChange={handleChange} required />
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
            />
            <small id="passwordHelp" className="form-text text-muted">
              Password must be at least 8 chars and include uppercase, lowercase, number & symbol.
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
