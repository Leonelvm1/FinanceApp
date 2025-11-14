// src/components/CurrencyInput.jsx
import React, { useEffect, useState, useRef } from "react";
import { parseCurrencyString, formatCurrency } from "../utils/currency";

/**
 * CurrencyInput
 *
 * Props:
 *  - value: number | null
 *  - onChangeNumber: (number|null) => void
 *  - locale: string (optional) default undefined (browser)
 *  - currency: string (optional) default "USD"
 *  - placeholder, className, name, id, required, inputMode
 *
 * Behavior:
 *  - Shows formatted currency on blur (eg "$1,234.56")
 *  - On focus shows raw numeric value (no grouping) so user can edit freely
 *  - onChangeNumber is called with parsed number (or null if empty/invalid)
 */
const CurrencyInput = ({
  value,
  onChangeNumber = () => {},
  locale = undefined,
  currency = "USD",
  placeholder = "",
  className = "",
  name,
  id,
  required = false,
  inputMode = "decimal",
  step = "0.01",
}) => {
  const [focused, setFocused] = useState(false);
  const [inner, setInner] = useState("");
  const ref = useRef(null);

  // Sync when parent value changes (and not focused)
  useEffect(() => {
    if (!focused) {
      if (value === null || value === undefined || value === "") {
        setInner("");
      } else {
        setInner(formatCurrency(value, { locale, currency }));
      }
    }
  }, [value, focused, locale, currency]);

  // When focusing -> show raw editable numeric string
  const handleFocus = (e) => {
    setFocused(true);
    // convert value to a plain string without grouping
    if (value === null || value === undefined || value === "") {
      setInner("");
    } else {
      // keep two decimals if exists
      const asNumber = Number(value);
      // don't force too many decimals; show as minimal representation
      setInner(String(asNumber % 1 === 0 ? asNumber.toFixed(0) : asNumber.toString()));
    }
    // move caret to end
    requestAnimationFrame(() => {
      try {
        const el = ref.current;
        if (el && typeof el.setSelectionRange === "function") {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      } catch (e) {
        /* ignore */
      }
    });
  };

  const handleBlur = (e) => {
    setFocused(false);
    // parse and notify
    const n = parseCurrencyString(inner);
    onChangeNumber(n);
    // set display formatted by effect
  };

  const handleChange = (e) => {
    // Accept user input but sanitize allowed chars (digits, dot, comma, minus)
    const raw = e.target.value;
    // Allow comma or dot while editing - parsing handles it
    const allowed = raw.replace(/[^0-9\-,.]/g, "");
    setInner(allowed);
    // also emit a parsed number (live)
    const n = parseCurrencyString(allowed);
    onChangeNumber(n);
  };

  return (
    <input
      ref={ref}
      name={name}
      id={id}
      className={className}
      placeholder={placeholder}
      inputMode={inputMode}
      value={inner}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={name || "currency-input"}
      required={required}
      step={step}
      autoComplete="off"
    />
  );
};

export default CurrencyInput;
