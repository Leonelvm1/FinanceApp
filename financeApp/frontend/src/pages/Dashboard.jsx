// src/pages/Dashboard.jsx
/**
 * Dashboard page (cleaned):
 * - removed "Client-side filter" / "Client-side filter active" strings
 * - keeps animated stat chips (Framer Motion)
 * - entries counts are animated and styled
 *
 * All comments and variable names remain in English for portfolio-readiness.
 */

import { useContext, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { CategoryContext } from "../context/CategoryContext";
import { deleteExpense, deleteIncome, deleteCategory } from "../services/api";
import IncomeForm from "../components/IncomeForm";
import ExpenseForm from "../components/ExpenseForm";
import CategoryForm from "../components/CategoryForm";
import FilterBar from "../components/FilterBar";
import { motion, AnimatePresence } from "framer-motion";

const rowAnim = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.995 },
  whileHover: { scale: 1.02 },
  transition: { duration: 0.36, type: "spring", stiffness: 160 },
};

const modalBackdropAnim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18 },
};

const modalCardAnim = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.99 },
  transition: { duration: 0.22, type: "spring", stiffness: 160 },
};

const Dashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const { categories, fetchCategories } = useContext(CategoryContext);

  // editing states used to open overlays
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  // filter state: categoryId "" means all categories
  const [filter, setFilter] = useState({ categoryId: "", type: "all" });

  if (!user) return <p className="text-center mt-5">Loading user data...</p>;

  const findCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";

  // --- handlers for CRUD deletes (with refresh)
  const handleDeleteIncome = async (id) => {
    if (!confirm("Delete this income?")) return;
    try {
      await deleteIncome(id);
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Error deleting income", err);
      alert("Delete failed");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Error deleting expense", err);
      alert("Delete failed");
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will remove this category from all associated records.`)) {
      return;
    }
    try {
      await deleteCategory(category.id);
      await fetchCategories();
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Could not delete category. It might be in use.");
    }
  };

  // callbacks after create/update to refresh UI
  const onCategorySaved = async () => {
    setEditingCategory(null);
    setCreatingCategory(false);
    await fetchCategories();
    if (refreshUser) await refreshUser();
  };
  const onIncomeSaved = async () => {
    setEditingIncome(null);
    if (refreshUser) await refreshUser();
  };
  const onExpenseSaved = async () => {
    setEditingExpense(null);
    if (refreshUser) await refreshUser();
  };

  const currency = (v) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

  // ------- Filtering using useMemo for performance -------
  const filteredIncomes = useMemo(() => {
    const raw = user.incomes || [];
    if (filter.type === "expense") return [];
    if (!filter.categoryId) return raw;
    return raw.filter((i) => String(i.category_id) === String(filter.categoryId));
  }, [user.incomes, filter]);

  const filteredExpenses = useMemo(() => {
    const raw = user.expenses || [];
    if (filter.type === "income") return [];
    if (!filter.categoryId) return raw;
    return raw.filter((e) => String(e.category_id) === String(filter.categoryId));
  }, [user.expenses, filter]);

  const subtotalIncomes = useMemo(
    () => filteredIncomes.reduce((s, x) => s + (Number(x.amount) || 0), 0),
    [filteredIncomes]
  );
  const subtotalExpenses = useMemo(
    () => filteredExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0),
    [filteredExpenses]
  );

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Welcome, {user.full_name} 👋</h1>
        <div className="text-end">
          <div className="small text-muted">Savings goal</div>
          <div style={{ fontWeight: 700 }}>{currency(user.savings_goal ?? 0)}</div>
          <div className="small text-muted">Progress: {user.savings_progress ?? 0}%</div>
        </div>
      </div>

      {/* Summary */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-bg-success text-center summary-card">
            <h5>Total Income</h5>
            <p className="fs-4">{currency(user.total_incomes ?? 0)}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-danger text-center summary-card">
            <h5>Total Expenses</h5>
            <p className="fs-4">{currency(user.total_expenses ?? 0)}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-info text-center summary-card">
            <h5>Balance</h5>
            <p className="fs-4">{currency(user.balance ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar value={filter} onChange={setFilter} />

      {/* Animated stats row (responsive). Only the chips - no "Client-side filter" text */}
      <motion.div className="mb-4 d-flex flex-wrap gap-3 stats-row" layout>
        {/* Filtered counts */}
        <motion.div
          className="stat-chip bg-success"
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          aria-live="polite"
        >
          <div className="stat-label">Filtered incomes</div>
          <motion.div
            key={filteredIncomes.length}
            className="stat-value"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            {filteredIncomes.length}
          </motion.div>
        </motion.div>

        <motion.div
          className="stat-chip bg-danger"
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03, type: "spring", stiffness: 160, damping: 18 }}
          aria-live="polite"
        >
          <div className="stat-label">Filtered expenses</div>
          <motion.div key={filteredExpenses.length} className="stat-value" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220 }}>
            {filteredExpenses.length}
          </motion.div>
        </motion.div>

        <motion.div
          className="stat-chip bg-info"
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, type: "spring", stiffness: 160, damping: 18 }}
          aria-live="polite"
        >
          <div className="stat-label">Subtotal incomes</div>
          <motion.div key={subtotalIncomes} className="stat-value">{currency(subtotalIncomes)}</motion.div>
        </motion.div>

        <motion.div
          className="stat-chip bg-warning"
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09, type: "spring", stiffness: 160, damping: 18 }}
          aria-live="polite"
        >
          <div className="stat-label">Subtotal expenses</div>
          <motion.div key={subtotalExpenses} className="stat-value" style={{ color: "#1d4d4f" }}>{currency(subtotalExpenses)}</motion.div>
        </motion.div>
      </motion.div>

      {/* Incomes section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Recent Incomes</h3>
          {/* animated small entries count */}
          <motion.small className="entries-count text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {(user.incomes || []).length} entries
          </motion.small>
        </div>

        <div className="mb-3">
          <IncomeForm onSaved={onIncomeSaved} />
        </div>

        <table className="table customized">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {filteredIncomes.map((inc, idx) => (
                <motion.tr
                  key={inc.id}
                  initial={rowAnim.initial}
                  animate={rowAnim.animate}
                  exit={rowAnim.exit}
                  whileHover={rowAnim.whileHover}
                  transition={rowAnim.transition}
                  className={`income-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}
                >
                  <td data-label="Description">{inc.description}</td>
                  <td data-label="Amount">{currency(inc.amount)}</td>
                  <td data-label="Category">{inc.category_name || findCategoryName(inc.category_id)}</td>
                  <td data-label="Date">{new Date(inc.date).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditingIncome(inc)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDeleteIncome(inc.id)}>Delete</button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </section>

      {/* Expenses section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Recent Expenses</h3>
          <motion.small className="entries-count text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {(user.expenses || []).length} entries
          </motion.small>
        </div>

        <div className="mb-3">
          <ExpenseForm onSaved={onExpenseSaved} />
        </div>

        <table className="table customized">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {filteredExpenses.map((exp, idx) => (
                <motion.tr
                  key={exp.id}
                  initial={rowAnim.initial}
                  animate={rowAnim.animate}
                  exit={rowAnim.exit}
                  whileHover={rowAnim.whileHover}
                  transition={rowAnim.transition}
                  className={`expense-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}
                >
                  <td data-label="Description">{exp.description}</td>
                  <td data-label="Amount">{currency(exp.amount)}</td>
                  <td data-label="Category">{exp.category_name || findCategoryName(exp.category_id)}</td>
                  <td data-label="Date">{new Date(exp.date).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditingExpense(exp)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDeleteExpense(exp.id)}>Delete</button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </section>

      {/* Categories */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Your Categories</h3>
          <div>
            <motion.button
              className="btn btn-sm btn-outline-primary me-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCreatingCategory(true)}
            >
              ➕ Add category
            </motion.button>
            <motion.small className="entries-count text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{(user.categories || []).length} entries</motion.small>
          </div>
        </div>

        <table className="table customized">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {(user.categories || []).map((cat, idx) => (
                <motion.tr
                  key={cat.id}
                  initial={rowAnim.initial}
                  animate={rowAnim.animate}
                  exit={rowAnim.exit}
                  whileHover={rowAnim.whileHover}
                  transition={rowAnim.transition}
                  className={`category-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}
                >
                  <td data-label="Name">{cat.name}</td>
                  <td data-label="Type">
                    {cat.is_global ? <span className="badge bg-primary">Global</span> : <span className="badge bg-secondary">User</span>}
                  </td>
                  <td data-label="Actions">
                    <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditingCategory(cat)}>Edit</button>
                    {!cat.is_global && <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDeleteCategory(cat)}>Delete</button>}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </section>

      {/* MODALS using AnimatePresence for enter/exit */}
      <AnimatePresence>
        {editingIncome && (
          <motion.div className="custom-modal-backdrop" initial={modalBackdropAnim.initial} animate={modalBackdropAnim.animate} exit={modalBackdropAnim.exit} transition={modalBackdropAnim.transition} onClick={() => setEditingIncome(null)}>
            <motion.div className="custom-modal" onClick={(e) => e.stopPropagation()} initial={modalCardAnim.initial} animate={modalCardAnim.animate} exit={modalCardAnim.exit} transition={modalCardAnim.transition}>
              <h5>Edit Income</h5>
              <IncomeForm initialData={editingIncome} onSaved={onIncomeSaved} onCancel={() => setEditingIncome(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingExpense && (
          <motion.div className="custom-modal-backdrop" initial={modalBackdropAnim.initial} animate={modalBackdropAnim.animate} exit={modalBackdropAnim.exit} transition={modalBackdropAnim.transition} onClick={() => setEditingExpense(null)}>
            <motion.div className="custom-modal" onClick={(e) => e.stopPropagation()} initial={modalCardAnim.initial} animate={modalCardAnim.animate} exit={modalCardAnim.exit} transition={modalCardAnim.transition}>
              <h5>Edit Expense</h5>
              <ExpenseForm initialData={editingExpense} onSaved={onExpenseSaved} onCancel={() => setEditingExpense(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(editingCategory || creatingCategory) && (
          <motion.div className="custom-modal-backdrop" initial={modalBackdropAnim.initial} animate={modalBackdropAnim.animate} exit={modalBackdropAnim.exit} transition={modalBackdropAnim.transition} onClick={() => { setEditingCategory(null); setCreatingCategory(false); }}>
            <motion.div className="custom-modal" onClick={(e) => e.stopPropagation()} initial={modalCardAnim.initial} animate={modalCardAnim.animate} exit={modalCardAnim.exit} transition={modalCardAnim.transition}>
              <h5>{editingCategory ? "Edit Category" : "Add Category"}</h5>
              <CategoryForm initialData={editingCategory} onSaved={onCategorySaved} onCancel={() => { setEditingCategory(null); setCreatingCategory(false); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
