// src/utils/validatePassword.js
/**
 * Password validation helper used by signup form.
 * Returns { valid: boolean, reasons: {...} } for detailed UI feedback.
 */

export function validatePassword(password = "") {
  const minLen = 8;
  const reasons = {
    length: password.length >= minLen,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password),
  };
  const valid = Object.values(reasons).every(Boolean);
  return { valid, reasons };
}
