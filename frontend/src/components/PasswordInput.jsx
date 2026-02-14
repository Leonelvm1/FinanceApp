import { useState } from "react";

const PasswordInput = ({
  label = "Password",
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  autoComplete = "password",
  error = null,
  className = "form-control",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          className={className}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={togglePasswordVisibility}
          title={showPassword ? "Hide password" : "Show password"}
          style={{
            fontSize: "0.9rem",
            padding: "0.375rem 0.75rem",
          }}
        >
          {showPassword ? <span>👁️</span> : <span>👁️‍🗨️</span>}
        </button>
      </div>
      {error && <small className="text-danger">{error}</small>}
    </div>
  );
};

export default PasswordInput;
