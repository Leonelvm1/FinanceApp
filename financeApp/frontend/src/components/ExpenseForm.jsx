import { useState, useContext } from "react";
import axios from "axios";
import { CategoryContext } from "../context/CategoryContext";

const ExpenseForm = ({ onCreated }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const { categories } = useContext(CategoryContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:8000/expenses",
      { description, amount: parseFloat(amount), category_id: category },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDescription("");
    setAmount("");
    setCategory("");
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2">
      <div className="col-md-4">
        <input
          type="text"
          className="form-control"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="col-md-3">
        <input
          type="number"
          className="form-control"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="col-md-3">
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-2">
        <button className="btn btn-danger w-100">Add</button>
      </div>
    </form>
  );
};

export default ExpenseForm;
