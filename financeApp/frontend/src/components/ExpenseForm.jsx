// src/components/ExpenseForm.jsx
import { useState, useEffect, useContext } from "react";
import { createExpense, updateExpense } from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import { AuthContext } from "../context/AuthContext";

const ExpenseForm = ({ initialData = null, onSaved = () => {}, onCancel = () => {} }) => {
  const isEdit = !!initialData;
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [date, setDate] = useState(initialData?.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);

  const { categories } = useContext(CategoryContext);
  const { refreshUser } = useContext(AuthContext);

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || "");
      setAmount(initialData.amount?.toString() || "");
      setCategoryId(initialData.category_id ?? "");
      setDate(initialData.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      description,
      amount: parseFloat(amount),
      date,
      category_id: Number(categoryId),
    };

    try {
      if (isEdit) {
        await updateExpense(initialData.id, payload);
      } else {
        await createExpense(payload);
      }
      if (refreshUser) await refreshUser();
      onSaved();
      if (!isEdit) {
        setDescription("");
        setAmount("");
        setCategoryId("");
        setDate(new Date().toISOString().split("T")[0]);
      }
    } catch (err) {
      console.error("[ExpenseForm] Save error", err);
      alert("Error saving expense. Check console.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2">
      <div className="col-md-5">
        <input type="text" className="form-control" placeholder="Description" value={description}
               onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="col-md-2">
        <input type="number" className="form-control" placeholder="Amount" value={amount}
               onChange={(e) => setAmount(e.target.value)} step="0.01" required />
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
        <button type="submit" className="btn btn-danger">{isEdit ? "Update" : "Add"}</button>
      </div>
    </form>
  );
};

export default ExpenseForm;
