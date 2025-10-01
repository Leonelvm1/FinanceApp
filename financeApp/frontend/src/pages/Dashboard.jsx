import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CategoryContext } from "../context/CategoryContext";

const Dashboard = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const { categories } = useContext(CategoryContext);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, expRes] = await Promise.all([
          axios.get("http://localhost:8000/incomes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/expenses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setIncomes(incRes.data);
        setExpenses(expRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [token]);

  const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
  const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-bg-success">
            <div className="card-body">
              <h5>Total Income</h5>
              <p className="fs-4">${totalIncome}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-danger">
            <div className="card-body">
              <h5>Total Expenses</h5>
              <p className="fs-4">${totalExpense}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-info">
            <div className="card-body">
              <h5>Balance</h5>
              <p className="fs-4">${totalIncome - totalExpense}</p>
            </div>
          </div>
        </div>
      </div>

      <h3>Categories Overview</h3>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
