import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CategoryContext } from "../context/CategoryContext";
import ExpenseForm from "../components/ExpenseForm";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const { categories } = useContext(CategoryContext);
  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    const res = await axios.get("http://localhost:8000/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "Uncategorized";

  return (
    <div>
      <h2>Expenses</h2>
      <ExpenseForm onCreated={fetchExpenses} />

      <table className="table mt-4">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.description}</td>
              <td>${exp.amount}</td>
              <td>{getCategoryName(exp.category_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Expenses;
