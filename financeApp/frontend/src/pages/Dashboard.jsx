// src/pages/Dashboard.jsx
import { useContext, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { CategoryContext } from "../context/CategoryContext";
import { deleteExpense, deleteIncome, deleteCategory } from "../services/api";
import IncomeForm from "../components/IncomeForm";
import ExpenseForm from "../components/ExpenseForm";
import CategoryForm from "../components/CategoryForm";
import FilterBar from "../components/FilterBar";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const { categories, fetchCategories } = useContext(CategoryContext);

  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [filter, setFilter] = useState({ categoryId: "", type: "all" });

  if (!user) return <p className="text-center mt-5">Loading user data...</p>;

  const findCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";

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

  // Client-side filtering and subtotals
  const filteredIncomes = useMemo(() => {
    const raw = user.incomes || [];
    if (!filter.categoryId && filter.type !== "expense") return raw;
    return raw.filter((i) => {
      if (filter.type === "expense") return false;
      if (!filter.categoryId) return true;
      return String(i.category_id) === String(filter.categoryId);
    });
  }, [user.incomes, filter]);

  const filteredExpenses = useMemo(() => {
    const raw = user.expenses || [];
    if (!filter.categoryId && filter.type !== "income") return raw;
    return raw.filter((e) => {
      if (filter.type === "income") return false;
      if (!filter.categoryId) return true;
      return String(e.category_id) === String(filter.categoryId);
    });
  }, [user.expenses, filter]);

  const subtotalIncomes = useMemo(() => filteredIncomes.reduce((s, x) => s + (Number(x.amount) || 0), 0), [filteredIncomes]);
  const subtotalExpenses = useMemo(() => filteredExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0), [filteredExpenses]);

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

      {/* Summary cards */}
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

      {/* Recent incomes */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Recent Incomes</h3>
          <small className="text-muted">{(user.incomes || []).length} entries</small>
        </div>

        <FilterBar value={filter} onChange={setFilter} />

        <div className="mb-3 d-flex gap-3">
          <div className="badge bg-success">Filtered incomes: {filteredIncomes.length}</div>
          <div className="badge bg-danger">Filtered expenses: {filteredExpenses.length}</div>
          <div className="badge bg-info">Subtotal incomes: {currency(subtotalIncomes)}</div>
          <div className="badge bg-warning" style={{ color: "#1d4d4f" }}>Subtotal expenses: {currency(subtotalExpenses)}</div>
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
            {filteredIncomes.map((inc, idx) => (
              <motion.tr
                key={inc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.02 }}
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
          </tbody>
        </table>
      </section>

      {/* Recent expenses */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Recent Expenses</h3>
          <small className="text-muted">{(user.expenses || []).length} entries</small>
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
            {filteredExpenses.map((exp, idx) => (
              <motion.tr
                key={exp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.02 }}
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
          </tbody>
        </table>
      </section>

      {/* Categories */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Your Categories</h3>
          <div>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setCreatingCategory(true)}>➕ Add category</button>
            <small className="text-muted">{(user.categories || []).length} entries</small>
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
            {(user.categories || []).map((cat, idx) => (
              <motion.tr
                key={cat.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.02 }}
                className={`category-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}
              >
                <td data-label="Name">{cat.name}</td>
                <td data-label="Type">
                  {cat.is_global ? (
                    <span className="badge bg-primary">Global</span>
                  ) : (
                    <span className="badge bg-secondary">User</span>
                  )}
                </td>
                <td data-label="Actions">
                  <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditingCategory(cat)}>Edit</button>
                  {!cat.is_global && (
                    <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDeleteCategory(cat)}>Delete</button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Edit overlays */}
      {editingIncome && (
        <div className="custom-modal-backdrop" onClick={() => setEditingIncome(null)}>
          <motion.div className="custom-modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <h5>Edit Income</h5>
            <IncomeForm initialData={editingIncome} onSaved={onIncomeSaved} onCancel={() => setEditingIncome(null)} />
          </motion.div>
        </div>
      )}

      {editingExpense && (
        <div className="custom-modal-backdrop" onClick={() => setEditingExpense(null)}>
          <motion.div className="custom-modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <h5>Edit Expense</h5>
            <ExpenseForm initialData={editingExpense} onSaved={onExpenseSaved} onCancel={() => setEditingExpense(null)} />
          </motion.div>
        </div>
      )}

      {(editingCategory || creatingCategory) && (
        <div className="custom-modal-backdrop" onClick={() => { setEditingCategory(null); setCreatingCategory(false); }}>
          <motion.div className="custom-modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <h5>{editingCategory ? "Edit Category" : "Add Category"}</h5>
            <CategoryForm
              initialData={editingCategory}
              onSaved={onCategorySaved}
              onCancel={() => { setEditingCategory(null); setCreatingCategory(false); }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
