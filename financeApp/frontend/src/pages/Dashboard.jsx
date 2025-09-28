const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard 🧭</h1>
      <p>Welcome to your personal finance dashboard. Here you'll manage your data.</p>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">💰 Balance</h5>
              <p className="card-text">$0.00</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📅 Transactions</h5>
              <p className="card-text">Coming soon...</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🎯 Savings Goal</h5>
              <p className="card-text">Track your goals here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
