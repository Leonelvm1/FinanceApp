import { useEffect, useState, useContext } from "react";
import { getExpenses } from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import ExpenseForm from "../components/ExpenseForm";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const { categories } = useContext(CategoryContext);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";

  return (
    <div>
      <h2>Expenses</h2>
      <ExpenseForm onCreated={fetchExpenses} />
      <table className="table mt-4">
        <thead><tr><th>Description</th><th>Amount</th><th>Category</th><th>Date</th></tr></thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.description}</td>
              <td>${exp.amount.toFixed(2)}</td>
              <td>{exp.category_name || getCategoryName(exp.category_id)}</td>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Expenses;
