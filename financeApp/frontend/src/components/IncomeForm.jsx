import { useState, useContext } from "react";
import { CategoryContext } from "../context/CategoryContext";
import { createIncome } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const IncomeForm = ({ onCreated = () => {} }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { categories } = useContext(CategoryContext);
  const { refreshUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIncome({
        description,
        amount: parseFloat(amount),
        date,
        category_id: Number(categoryId),
      });
      if (refreshUser) await refreshUser();
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
      onCreated();
    } catch (err) {
      console.error("[IncomeForm] Error creating income:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2">
      <div className="col-md-4">
        <input type="text" className="form-control" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} required />
      </div>
      <div className="col-md-2">
        <input type="number" className="form-control" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} step="0.01" required />
      </div>
      <div className="col-md-3">
        <select className="form-select" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} required>
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className="col-md-2">
        <input type="date" className="form-control" value={date} onChange={(e)=>setDate(e.target.value)} required />
      </div>
      <div className="col-md-1">
        <button className="btn btn-primary w-100">Add</button>
      </div>
    </form>
  );
};

export default IncomeForm;
