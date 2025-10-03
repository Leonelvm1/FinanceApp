// src/pages/Expenses.jsx
import { useEffect, useState, useContext } from "react";
import { getExpenses, deleteExpense } from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import { AuthContext } from "../context/AuthContext";
import ExpenseForm from "../components/ExpenseForm";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const { categories } = useContext(CategoryContext);
  const { refreshUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  useEffect(() => { 
    fetchExpenses(); 
  }, []);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";
  const currency = (v) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      await fetchExpenses();
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Delete expense failed", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="container">
      <h2>Expenses</h2>

      {/* Create form */}
      <div className="mb-3">
        <ExpenseForm onSaved={() => { 
          fetchExpenses(); 
          if (refreshUser) refreshUser();
        }} />
      </div>

      <table className="table customized">
        <thead>
          <tr><th>Description</th><th>Amount</th><th>Category</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={exp.id} className={`expense-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}>
              <td data-label="Description">{exp.description}</td>
              <td data-label="Amount">{currency(exp.amount || 0)}</td>
              <td data-label="Category">{exp.category_name || getCategoryName(exp.category_id)}</td>
              <td data-label="Date">{new Date(exp.date).toLocaleDateString()}</td>
              <td data-label="Actions">
                <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditing(exp)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDelete(exp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit modal */}
      {editing && (
        <div className="custom-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>Edit Expense</h5>
            <ExpenseForm 
              initialData={editing} 
              onSaved={() => { 
                setEditing(null); 
                fetchExpenses(); 
                if (refreshUser) refreshUser();
              }} 
              onCancel={() => setEditing(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;