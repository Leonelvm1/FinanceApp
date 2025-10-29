// src/components/FilterBar.jsx
/**
 * FilterBar lets user filter by category and type (all/income/expense).
 *
 * Props:
 *  - value: { categoryId: string|number, type: "all"|"income"|"expense" }
 *  - onChange: (newValue) => void
 *
 * Notes:
 *  - This component is "visual only" (client-side). It does NOT show any
 *    "Client-side filter" textual label (removed by request).
 *  - Uses framer-motion for subtle entrance/layout animations.
 *  - Keeps selects controlled and accessible.
 */

import { useContext, useMemo, useCallback } from "react";
import { CategoryContext } from "../context/CategoryContext";
import { motion } from "framer-motion";

const containerAnim = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 200, damping: 20, duration: 0.28 },
};

const selectAnim = { whileFocus: { scale: 1.02 }, transition: { type: "spring", stiffness: 260 } };

const FilterBar = ({ value = { categoryId: "", type: "all" }, onChange = () => {} }) => {
  const { categories } = useContext(CategoryContext);

  // Build options: default 'All categories' + server-provided categories
  const categoryOptions = useMemo(() => [{ id: "", name: "All categories" }, ...(categories || [])], [categories]);

  // Local handlers keep code small and explicit
  const handleCategoryChange = useCallback(
    (e) => {
      // Keep categoryId as string (consistent with existing usage in dashboard)
      onChange({ ...value, categoryId: e.target.value });
    },
    [onChange, value]
  );

  const handleTypeChange = useCallback(
    (e) => {
      onChange({ ...value, type: e.target.value });
    },
    [onChange, value]
  );

  const handleClear = useCallback(() => {
    onChange({ categoryId: "", type: "all" });
  }, [onChange]);

  return (
    <motion.div
      className="d-flex gap-2 align-items-center mb-3"
      initial={containerAnim.initial}
      animate={containerAnim.animate}
      transition={containerAnim.transition}
      role="region"
      aria-label="Filters"
    >
      {/* Category select */}
      <motion.select
        className="form-select"
        style={{ maxWidth: 340 }}
        value={String(value.categoryId ?? "")}
        onChange={handleCategoryChange}
        aria-label="Filter by category"
        whileFocus={selectAnim.whileFocus}
        transition={selectAnim.transition}
      >
        {categoryOptions.map((c) => (
          // Some categories may come as plain objects with id/name
          <option key={String(c.id ?? "")} value={String(c.id ?? "")}>
            {c.name}
          </option>
        ))}
      </motion.select>

      {/* Type select */}
      <motion.select
        className="form-select"
        style={{ maxWidth: 160 }}
        value={value.type}
        onChange={handleTypeChange}
        aria-label="Filter by type (all, incomes, expenses)"
        whileFocus={selectAnim.whileFocus}
        transition={selectAnim.transition}
      >
        <option value="all">All</option>
        <option value="income">Incomes</option>
        <option value="expense">Expenses</option>
      </motion.select>

      {/* Left spacer then actions */}
      <div className="ms-auto d-flex gap-2 align-items-center">
        {/* Clear filter button (small and unobtrusive) */}
        <motion.button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={handleClear}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Clear filters"
          title="Clear filters"
        >
          Clear
        </motion.button>

        {/* Optional: small helper (non-intrusive) - removed textual 'Client-side filter' by design */}
      </div>
    </motion.div>
  );
};

export default FilterBar;
