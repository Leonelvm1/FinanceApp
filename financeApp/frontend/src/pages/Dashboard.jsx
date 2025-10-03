// src/pages/Dashboard.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CategoryContext } from "../context/CategoryContext";
import { deleteExpense, deleteIncome, deleteCategory } from "../services/api";
import IncomeForm from "../components/IncomeForm";
import ExpenseForm from "../components/ExpenseForm";
import CategoryForm from "../components/CategoryForm";

const Dashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const { categories, fetchCategories } = useContext(CategoryContext);

  // Editing states used to open small overlay modals
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

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

      {/* Recent incomes table */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3>Recent Incomes</h3>
          <small className="text-muted">{(user.incomes || []).length} entries</small>
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
            {(user.incomes || []).map((inc, idx) => (
              <tr key={inc.id} className={`income-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}>
                <td data-label="Description">{inc.description}</td>
                <td data-label="Amount">{currency(inc.amount)}</td>
                <td data-label="Category">{inc.category_name || findCategoryName(inc.category_id)}</td>
                <td data-label="Date">{new Date(inc.date).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditingIncome(inc)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDeleteIncome(inc.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recent expenses table */}
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
            {(user.expenses || []).map((exp, idx) => (
              <tr key={exp.id} className={`expense-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}>
                <td data-label="Description">{exp.description}</td>
                <td data-label="Amount">{currency(exp.amount)}</td>
                <td data-label="Category">{exp.category_name || findCategoryName(exp.category_id)}</td>
                <td data-label="Date">{new Date(exp.date).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditingExpense(exp)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDeleteExpense(exp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Categories table */}
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
              <tr key={cat.id} className={`category-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Edit overlays */}
      {editingIncome && (
        <div className="custom-modal-backdrop" onClick={() => setEditingIncome(null)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>Edit Income</h5>
            <IncomeForm initialData={editingIncome} onSaved={onIncomeSaved} onCancel={() => setEditingIncome(null)} />
          </div>
        </div>
      )}

      {editingExpense && (
        <div className="custom-modal-backdrop" onClick={() => setEditingExpense(null)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>Edit Expense</h5>
            <ExpenseForm initialData={editingExpense} onSaved={onExpenseSaved} onCancel={() => setEditingExpense(null)} />
          </div>
        </div>
      )}

      {(editingCategory || creatingCategory) && (
        <div className="custom-modal-backdrop" onClick={() => { setEditingCategory(null); setCreatingCategory(false); }}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>{editingCategory ? "Edit Category" : "Add Category"}</h5>
            <CategoryForm
              initialData={editingCategory}
              onSaved={onCategorySaved}
              onCancel={() => { setEditingCategory(null); setCreatingCategory(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;