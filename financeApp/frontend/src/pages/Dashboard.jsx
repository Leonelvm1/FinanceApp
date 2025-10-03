import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CategoryContext } from "../context/CategoryContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { categories } = useContext(CategoryContext);

  if (!user) return <p className="text-center mt-5">Loading user data...</p>;

  // compute totals using backend values if present, otherwise compute locally
  const totalIncome =
    typeof user.total_incomes === "number"
      ? user.total_incomes
      : (user.incomes || []).reduce((acc, i) => acc + (i.amount || 0), 0);

  const totalExpense =
    typeof user.total_expenses === "number"
      ? user.total_expenses
      : (user.expenses || []).reduce((acc, e) => acc + (e.amount || 0), 0);

  const balance =
    typeof user.balance === "number" ? user.balance : totalIncome - totalExpense;

  const currency = (v) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

  const findCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Uncategorized";

  return (
    <div>
      <h1>Welcome, {user.full_name} 👋</h1>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-bg-success summary-card">
            <div className="card-body">
              <h5>Total Income</h5>
              <p className="fs-4">{currency(totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-bg-danger summary-card">
            <div className="card-body">
              <h5>Total Expenses</h5>
              <p className="fs-4">{currency(totalExpense)}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-bg-info summary-card">
            <div className="card-body">
              <h5>Balance</h5>
              <p className="fs-4">{currency(balance)}</p>
            </div>
          </div>
        </div>
      </div>

      <h3>Recent Incomes</h3>
      <ul className="list-group mb-4">
        {(user.incomes || []).map((inc) => (
          <li key={inc.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{inc.description}</strong>
              <div className="text-muted">{new Date(inc.date).toLocaleDateString()}</div>
              <small className="text-secondary">
                {inc.category_name || findCategoryName(inc.category_id)}
              </small>
            </div>
            <div className="badge bg-success">{currency(inc.amount || 0)}</div>
          </li>
        ))}
      </ul>

      <h3>Recent Expenses</h3>
      <ul className="list-group mb-4">
        {(user.expenses || []).map((exp) => (
          <li key={exp.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{exp.description}</strong>
              <div className="text-muted">{new Date(exp.date).toLocaleDateString()}</div>
              <small className="text-secondary">
                {exp.category_name || findCategoryName(exp.category_id)}
              </small>
            </div>
            <div className="badge bg-danger">{currency(exp.amount || 0)}</div>
          </li>
        ))}
      </ul>

      <h3>Your Categories</h3>
      <div className="d-flex flex-wrap gap-2">
        {(user.categories || []).map((cat) => (
          <span key={cat.id} className="badge bg-secondary p-2">{cat.name}</span>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
