// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Incomes from "./pages/Incomes";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import Layout from "./components/Layout";

const App = () => {
  const { user } = useContext(AuthContext); // server-validated user object

  return (
    <Routes>
      {/* Public landing - always available */}
      <Route path="/" element={<Home />} />

      {/* Public auth pages (redirect to /dashboard when already logged) */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      {/* Protected routes wrapper:
          - No `path` on parent to avoid conflicts with root "/"
          - If user exists -> render Layout (which should include <Outlet />)
          - If no user -> redirect to landing "/"
      */}
      <Route element={user ? <Layout /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/incomes" element={<Incomes />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/categories" element={<Categories />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
};

export default App;

