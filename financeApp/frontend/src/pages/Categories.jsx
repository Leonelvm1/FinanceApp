// src/pages/Categories.jsx
import CategoryList from "../components/CategoryList";

const Categories = () => {
  return (
    <div className="container">
      <h2 className="mb-4">Manage Categories</h2>
      <div className="card p-4 shadow-sm">
        <CategoryList />
      </div>
    </div>
  );
};

export default Categories;