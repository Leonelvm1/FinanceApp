// src/pages/Categories.jsx
/**
 * Categories page
 *
 * Purpose:
 *  - Page wrapper for category management UI (CategoryList).
 *  - Kept intentionally minimal — the CategoryList contains the core logic/UI.
 */

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
