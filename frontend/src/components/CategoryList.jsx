// src/components/CategoryList.jsx
/**
 * CategoryList
 *
 * Purpose:
 *  - Render a list/table of categories.
 *  - Allow creating and editing via CategoryForm modal overlays.
 *  - Allow deleting user categories (global categories cannot be deleted).
 *
 * Context dependencies:
 *  - CategoryContext: provides categories and fetchCategories()
 *  - AuthContext: provides refreshUser() to reload user dashboard after changes
 *
 * Notes:
 *  - Deletion shows a simple confirm() modal.
 *  - When adding/updating/deleting it triggers fetchCategories() and optionally refreshUser().
 */

import { useContext, useState } from "react";
import { CategoryContext } from "../context/CategoryContext";
import { AuthContext } from "../context/AuthContext";
import { deleteCategory } from "../services/api";
import CategoryForm from "./CategoryForm";

const CategoryList = () => {
  const { categories, fetchCategories } = useContext(CategoryContext);
  const { refreshUser } = useContext(AuthContext);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (category) => {
    // Simple confirmation to avoid accidental deletes
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will remove this category from all associated records.`)) {
      return;
    }
    
    try {
      await deleteCategory(category.id);
      await fetchCategories();
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Could not delete category. It might be in use.");
    }
  };

  const onCategorySaved = async () => {
    setEditingCategory(null);
    setShowForm(false);
    await fetchCategories();
    if (refreshUser) await refreshUser();
  };

  if (!categories.length) {
    return (
      <div className="card p-4 text-center">
        <p>No categories available.</p>
        <button 
          className="btn btn-primary mt-2"
          onClick={() => setShowForm(true)}
        >
          Add Your First Category
        </button>
        
        {showForm && (
          <div className="custom-modal-backdrop" onClick={() => setShowForm(false)}>
            <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
              <h5>Add Category</h5>
              <CategoryForm
                onSaved={onCategorySaved}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Available Categories</h5>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(true)}
        >
          + Add Category
        </button>
      </div>

      <table className="table customized">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th style={{ width: 200 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, idx) => (
            <tr key={category.id} className={`category-row ${idx % 2 === 0 ? 'row-even' : 'row-odd'}`}>
              <td data-label="Name">{category.name}</td>
              <td data-label="Type">
                {category.is_global ? (
                  <span className="badge bg-primary">Global</span>
                ) : (
                  <span className="badge bg-secondary">User</span>
                )}
              </td>
              <td data-label="Actions">
                <button 
                  className="btn btn-sm btn-outline-secondary table-action-btn" 
                  onClick={() => setEditingCategory(category)}
                >
                  Edit
                </button>
                {!category.is_global && (
                  <button 
                    className="btn btn-sm btn-outline-danger table-action-btn" 
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="custom-modal-backdrop" onClick={() => setEditingCategory(null)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>Edit Category</h5>
            <CategoryForm
              initialData={editingCategory}
              onSaved={onCategorySaved}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="custom-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h5>Add Category</h5>
            <CategoryForm
              onSaved={onCategorySaved}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
