import { useContext } from "react";
import { CategoryContext } from "../context/CategoryContext";

const CategoryList = () => {
  const { categories } = useContext(CategoryContext);

  if (!categories.length) return <p>No categories available.</p>;

  return (
    <div className="card p-3 shadow-sm">
      <h5 className="mb-3">Available Categories</h5>
      <ul className="list-group">
        {categories.map((category) => (
          <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center">
            {category.name}
            {category.is_global && <span className="badge bg-primary">Global</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;

