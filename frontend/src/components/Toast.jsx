// src/components/Toast.jsx
import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css"; // <-- import main css which includes toast styles

/**
 * ToastProvider + useToast
 *
 * Usage:
 *  const { showToast, showConfirm } = useToast();
 *  showToast({ type: "success", title: "Saved", message: "..." });
 *  const ok = await showConfirm({ title: "Delete", message: "Are you sure?" });
 */

const ToastContext = createContext(null);
let idCounter = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]); // { id, type, title, message, duration, closable }
  const [confirm, setConfirm] = useState(null); // { id, resolve, opts }
  const timers = useRef(new Map());

  // cleanup timers on unmount
  useEffect(() => () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const showToast = useCallback((opts = {}) => {
    const {
      type = "info",
      title = "",
      message = "",
      duration = 4000,
      closable = true,
    } = opts;

    const id = idCounter++;
    const toast = { id, type, title, message, duration, closable };
    // add to the top
    setToasts((s) => [toast, ...s]);

    if (duration && duration > 0) {
      const timer = setTimeout(() => removeToast(id), duration);
      timers.current.set(id, timer);
    }
    return id;
  }, [removeToast]);

  const showConfirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      const id = idCounter++;
      setConfirm({ id, opts, resolve });
    });
  }, []);

  const handleConfirmClose = useCallback((result) => {
    if (!confirm) return;
    try { confirm.resolve(result); } catch (e) { /* ignore */ } finally { setConfirm(null); }
  }, [confirm]);

  const ctx = useMemo(() => ({ showToast, showConfirm, removeToast }), [showToast, showConfirm, removeToast]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {createPortal(
        <div className="toast-viewport" aria-live="polite" aria-atomic="true">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 600, damping: 38 }}
                className={`toast-card ${t.type}`}
                role="status"
                aria-live="polite"
              >
                <div className="toast-body">
                  {t.title && <div className="toast-title">{t.title}</div>}
                  {t.message && <div className="toast-message">{t.message}</div>}
                </div>

                {t.closable && (
                  <button
                    className="toast-close"
                    aria-label="Close toast"
                    onClick={() => removeToast(t.id)}
                    title="Close"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}

      {confirm &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="toast-confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="toast-confirm-card"
                initial={{ y: 16, opacity: 0, scale: 0.995 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.995 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="toast-confirm-title">{confirm.opts.title || "Confirm"}</div>
                <div className="toast-confirm-message">{confirm.opts.message || ""}</div>
                <div className="toast-confirm-actions">
                  <button className="toast-confirm-btn cancel" onClick={() => handleConfirmClose(false)}>
                    {confirm.opts.cancelText || "Cancel"}
                  </button>
                  <button className="toast-confirm-btn confirm" onClick={() => handleConfirmClose(true)}>
                    {confirm.opts.confirmText || "OK"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

export default ToastProvider;
