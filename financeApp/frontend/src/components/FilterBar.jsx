// src/components/FilterBar.jsx
/**
 * FilterBar lets user filter by category and type (all/income/expense).
 * - value: { categoryId, type }
 * - onChange: (newValue) => void
 */

import { useContext, useMemo } from "react";
import { CategoryContext } from "../context/CategoryContext";

const FilterBar = ({ value = { categoryId: "", type: "all" }, onChange = () => {} }) => {
  const { categories } = useContext(CategoryContext);

  const categoryOptions = useMemo(() => [{ id: "", name: "All categories" }, ...categories], [categories]);

  return (
    <div className="d-flex gap-2 align-items-center mb-3">
      <select
        className="form-select"
        style={{ maxWidth: 320 }}
        value={value.categoryId}
        onChange={(e) => onChange({ ...value, categoryId: e.target.value })}
      >
        {categoryOptions.map((c) => (
          <option key={c.id ?? "all"} value={c.id ?? ""}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className="form-select"
        style={{ maxWidth: 160 }}
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
      >
        <option value="all">All</option>
        <option value="income">Incomes</option>
        <option value="expense">Expenses</option>
      </select>

      <div className="ms-auto text-muted">
        <small>Client-side filter</small>
      </div>
    </div>
  );
};

export default FilterBar;
