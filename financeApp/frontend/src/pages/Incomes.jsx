import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CategoryContext } from "../context/CategoryContext";
import IncomeForm from "../components/IncomeForm";

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const { categories } = useContext(CategoryContext);
  const token = localStorage.getItem("token");

  const fetchIncomes = async () => {
    const res = await axios.get("http://localhost:8000/incomes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIncomes(res.data);
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "Uncategorized";

  return (
    <div>
      <h2>Incomes</h2>
      <IncomeForm onCreated={fetchIncomes} />

      <table className="table mt-4">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((income) => (
            <tr key={income.id}>
              <td>{income.description}</td>
              <td>${income.amount}</td>
              <td>{getCategoryName(income.category_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Incomes;
