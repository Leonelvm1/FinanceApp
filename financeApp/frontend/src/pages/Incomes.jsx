import { useEffect, useState, useContext } from "react";
import { getIncomes, deleteIncome } from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import IncomeForm from "../components/IncomeForm";

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const { categories } = useContext(CategoryContext);
  const [editing, setEditing] = useState(null);

  const fetchIncomes = async () => {
    try {
      const res = await getIncomes();
      setIncomes(res.data || []);
    } catch (err) {
      console.error("Error fetching incomes", err);
    }
  };

  useEffect(() => { fetchIncomes(); }, []);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";
  const currency = (v) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

  const handleDelete = async (id) => {
    if (!confirm("Delete this income?")) return;
    try {
      await deleteIncome(id);
      await fetchIncomes();
    } catch (err) {
      console.error("Delete income failed", err);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h2>Incomes</h2>

      {/* Create form (no modal) */}
      <div className="mb-3">
        <IncomeForm onSaved={fetchIncomes} />
      </div>

      <table className="table customized">
        <thead>
          <tr><th>Description</th><th>Amount</th><th>Category</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {incomes.map((inc) => (
            <tr key={inc.id} className="income-row">
              <td data-label="Description">{inc.description}</td>
              <td data-label="Amount">{currency(inc.amount || 0)}</td>
              <td data-label="Category">{inc.category_name || getCategoryName(inc.category_id)}</td>
              <td data-label="Date">{new Date(inc.date).toLocaleDateString()}</td>
              <td data-label="Actions">
                <button className="btn btn-sm btn-outline-secondary table-action-btn" onClick={() => setEditing(inc)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger table-action-btn" onClick={() => handleDelete(inc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit modal (simple overlay) */}
      {editing && (
        <div className="custom-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>Edit Income</h5>
            <IncomeForm initialData={editing} onSaved={() => { setEditing(null); fetchIncomes(); }} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Incomes;
