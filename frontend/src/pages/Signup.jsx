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
/**
 * Signup page (refactored)
 * - shows animated card (mini-bounce)
 * - uses toast notifications on success / error
 * - client-side password validation + confirm password
 */

// src/pages/Signup.jsx
/**
 * Signup page with:
 *  - formatted savings_goal input (thousands separators & cents)
 *  - client-side password rules (validatePassword)
 *  - animated success / error alerts using Framer Motion (mini-bounce)
 *
 * Data contract:
 *  - Submits JSON matching backend UserDTOPetition:
 *      { full_name, birth_date, location, savings_goal (number), password }
 *
 * UX details:
 *  - Input shows formatted value on blur (2 decimals).
 *  - On focus it shows a raw editable number (no grouping) for easy editing.
 *  - Alerts auto-hide after 3.2s.
 */

// src/pages/Signup.jsx
/**
 * Signup page - uses toast notifications and formats savings_goal input.
 */
// src/pages/Signup.jsx
/**
 * Signup page - uses:
 *  - CurrencyInput (src/components/CurrencyInput.jsx) for savings_goal
 *  - useToast (global provider already in main.jsx)
 *  - Framer Motion mini-bounce for the card
 *
 * Data sent:
 *  { full_name, birth_date, location, savings_goal (number), password }
 */
// src/pages/Signup.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { validatePassword } from "../utils/validatePassword";
import CurrencyInput from "../components/CurrencyInput";
import { useToast } from "../components/Toast";
import PasswordInput from "../components/PasswordInput";

const cardAnim = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: { y: -4, scale: 1.002 },
  transition: { type: "spring", stiffness: 200, damping: 18, duration: 0.28 },
};

const Signup = () => {
  const { signup, token } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    location: "",
    savings_goal: null, // number | null
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSavingsChange = (num) => {
    // num is number | null
    setForm((s) => ({ ...s, savings_goal: num }));
  };

  const pw = validatePassword(form.password);
  const passwordsMatch = form.password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pw.valid) {
      showToast({
        type: "warning",
        title: "Weak password",
        message: "Please strengthen your password according to the rules.",
        duration: 5200,
        closable: true,
      });
      return;
    }

    if (!passwordsMatch) {
      showToast({
        type: "error",
        title: "Passwords mismatch",
        message: "Passwords do not match. Please confirm your password.",
        duration: 5200,
        closable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        birth_date: form.birth_date,
        location: form.location,
        savings_goal: Number(form.savings_goal ?? 0),
        password: form.password,
      };

      await signup(payload);

      showToast({
        type: "success",
        title: "Account created",
        message: "Your account was created — please sign in.",
        duration: 3600,
        closable: true,
      });

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      const msg = err?.response?.data?.detail || "Failed to create account.";
      showToast({
        type: "error",
        title: "Signup error",
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
      <motion.div
        className="card shadow-sm p-4"
        style={{ width: 520 }}
        initial={cardAnim.initial}
        animate={cardAnim.animate}
        whileHover={cardAnim.whileHover}
        transition={cardAnim.transition}
      >
        <h3 className="mb-3">Create an account</h3>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input
                name="full_name"
                className="form-control"
                placeholder="Choose your username"
                value={form.full_name}
                onChange={handleChange}
                required
                autoComplete="username"
              />
              <small className="form-text text-muted">
                You'll use this to log in
              </small>
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
              <label className="form-label">Savings goal (USD)</label>
              <CurrencyInput
                name="savings_goal"
                value={form.savings_goal}
                onChangeNumber={handleSavingsChange}
                placeholder="0.00"
                locale="en-US"
                currency="USD"
                className="form-control"
              />
              <small className="text-muted">
                Type numbers and separators — we'll store the numeric value.
              </small>
            </div>
          </div>

          <div className="mb-3">
            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required={true}
              autoComplete="new-password"
              error={
                form.password && !pw.valid
                  ? "Password doesn't meet requirements"
                  : null
              }
            />
            <small id="passwordHelp" className="form-text text-muted">
              Password must be at least 8 characters and include uppercase,
              lowercase, number & symbol.
            </small>

            <div className="mt-2">
              <ul className="list-unstyled mb-0" style={{ fontSize: 14 }}>
                <li style={{ color: pw.reasons.length ? "green" : "#a0a0a0" }}>
                  • Minimum 8 characters
                </li>
                <li
                  style={{ color: pw.reasons.hasUpper ? "green" : "#a0a0a0" }}
                >
                  • Uppercase letter
                </li>
                <li
                  style={{ color: pw.reasons.hasLower ? "green" : "#a0a0a0" }}
                >
                  • Lowercase letter
                </li>
                <li
                  style={{ color: pw.reasons.hasNumber ? "green" : "#a0a0a0" }}
                >
                  • Number
                </li>
                <li
                  style={{ color: pw.reasons.hasSymbol ? "green" : "#a0a0a0" }}
                >
                  • Symbol (e.g. !@#$%)
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-3">
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required={true}
              autoComplete="new-password"
              error={
                !passwordsMatch && confirmPassword.length > 0
                  ? "Passwords do not match"
                  : null
              }
            />
          </div>

          <button
            className="btn btn-success w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <small className="text-muted">
            Already have an account? <a href="/login">Sign in</a>
          </small>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
