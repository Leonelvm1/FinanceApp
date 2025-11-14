// src/utils/currency.js
export const parseCurrencyString = (str) => {
  if (str === null || str === undefined) return null;
  const s = String(str).trim();
  if (s === "") return null;
  // keep digits, dot, minus
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  // if multiple dots, keep first and remove others
  const parts = cleaned.split(".");
  const normalized = parts.length <= 1 ? cleaned : parts[0] + "." + parts.slice(1).join("");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
};

export const formatCurrency = (num, { locale = undefined, currency = "USD", maximumFractionDigits = 2 } = {}) => {
  if (num === null || num === undefined || num === "") return "";
  const n = Number(num);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(n);
};
