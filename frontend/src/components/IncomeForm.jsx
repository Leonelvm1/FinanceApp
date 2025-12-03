// src/components/IncomeForm.jsx
/**
 * IncomeForm
 *
 * Purpose:
 *  - Create or edit an income item.
 *  - Mirrors ExpenseForm behavior.
 *
 * Props:
 *  - initialData: optional income object
 *  - onSaved: callback fired after save
 *  - onCancel: callback to close form/modal
 */

// src/components/IncomeForm.jsx
/**
 * IncomeForm - mirrors ExpenseForm but with primary styling; uses useToast and amount formatting.
 */

/// src/components/IncomeForm.jsx
import { useState, useEffect, useContext } from "react";
import { createIncome, updateIncome } from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import { AuthContext } from "../context/AuthContext";
import CurrencyInput from "./CurrencyInput";
import { useToast } from "./Toast";

const IncomeForm = ({ initialData = null, onSaved = () => {}, onCancel = () => {} }) => {
  const isEdit = !!initialData;
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount ?? null);
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [date, setDate] = useState(initialData?.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const { categories } = useContext(CategoryContext);
  const { refreshUser } = useContext(AuthContext);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || "");
      setAmount(initialData.amount ?? null);
      setCategoryId(initialData.category_id ?? "");
      setDate(initialData.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        description,
        amount: Number(amount ?? 0),
        date,
        category_id: Number(categoryId),
      };

      if (isEdit) {
        await updateIncome(initialData.id, payload);
        showToast({ type: "success", title: "Income updated", message: "Income updated successfully.", duration: 3000, closable: true });
      } else {
        await createIncome(payload);
        showToast({ type: "success", title: "Income added", message: "Income created successfully.", duration: 3000, closable: true });
      }

      if (refreshUser) await refreshUser();
      onSaved();

      if (!isEdit) {
        setDescription("");
        setAmount(null);
        setCategoryId("");
        setDate(new Date().toISOString().split("T")[0]);
      }
    } catch (err) {
      console.error("[IncomeForm] Save error", err);
      showToast({ type: "error", title: "Save failed", message: "Error saving income. See console.", duration: 6000, closable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2">
      <div className="col-md-5">
        <input type="text" className="form-control" placeholder="Description" value={description}
               onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="col-md-2">
        <CurrencyInput
          value={amount}
          onChangeNumber={(n) => setAmount(n)}
          placeholder="0.00"
          className="form-control"
          currency="USD"
          locale="en-US"
        />
      </div>
      <div className="col-md-3">
        <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className="col-md-2">
        <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="col-12 mt-2 d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-link cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className={isEdit ? "btn btn-primary" : "btn btn-success"} disabled={loading}>
          {isEdit ? (loading ? "Updating..." : "Update") : (loading ? "Adding..." : "Add")}
        </button>
      </div>
    </form>
  );
};

export default IncomeForm;
