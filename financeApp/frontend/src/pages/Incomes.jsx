import { useEffect, useState, useContext } from "react";
import { getIncomes } from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import IncomeForm from "../components/IncomeForm";

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const { categories } = useContext(CategoryContext);

  const fetchIncomes = async () => {
    try {
      const res = await getIncomes();
      setIncomes(res.data);
    } catch (err) {
      console.error("Error fetching incomes", err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";

  return (
    <div>
      <h2>Incomes</h2>
      <IncomeForm onCreated={fetchIncomes} />
      <table className="table mt-4">
        <thead><tr><th>Description</th><th>Amount</th><th>Category</th><th>Date</th></tr></thead>
        <tbody>
          {incomes.map((inc) => (
            <tr key={inc.id}>
              <td>{inc.description}</td>
              <td>${inc.amount.toFixed(2)}</td>
              <td>{inc.category_name || getCategoryName(inc.category_id)}</td>
              <td>{new Date(inc.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Incomes;
