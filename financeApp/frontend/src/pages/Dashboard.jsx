import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CategoryContext } from "../context/CategoryContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { categories } = useContext(CategoryContext);

  if (!user) return <p className="text-center mt-5">Loading user data...</p>;

  const totalIncome = user.total_incomes ?? 0;
  const totalExpense = user.total_expenses ?? 0;
  const balance = user.balance ?? 0;

  const findCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";

  return (
    <div>
      <h1>Welcome, {user.full_name} 👋</h1>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-bg-success">
            <div className="card-body">
              <h5>Total Income</h5>
              <p className="fs-4">${totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-danger">
            <div className="card-body">
              <h5>Total Expenses</h5>
              <p className="fs-4">${totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-info">
            <div className="card-body">
              <h5>Balance</h5>
              <p className="fs-4">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <h3>Recent Incomes</h3>
      <ul className="list-group mb-4">
        {user.incomes.map((inc) => (
          <li key={inc.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{inc.description}</strong>
              <div className="text-muted">{new Date(inc.date).toLocaleDateString()}</div>
              <small className="text-secondary">{inc.category_name || findCategoryName(inc.category_id)}</small>
            </div>
            <div className="badge bg-success">${inc.amount.toFixed(2)}</div>
          </li>
        ))}
      </ul>

      <h3>Recent Expenses</h3>
      <ul className="list-group mb-4">
        {user.expenses.map((exp) => (
          <li key={exp.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{exp.description}</strong>
              <div className="text-muted">{new Date(exp.date).toLocaleDateString()}</div>
              <small className="text-secondary">{exp.category_name || findCategoryName(exp.category_id)}</small>
            </div>
            <div className="badge bg-danger">${exp.amount.toFixed(2)}</div>
          </li>
        ))}
      </ul>

      <h3>Your Categories</h3>
      <div className="d-flex flex-wrap gap-2">
        {user.categories.map((cat) => (
          <span key={cat.id} className="badge bg-secondary p-2">{cat.name}</span>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
