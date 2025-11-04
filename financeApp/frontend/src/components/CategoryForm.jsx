// src/components/CategoryForm.jsx
/**
 * CategoryForm
 *
 * Purpose:
 *  - Reusable form used to create or update a Category.
 *  - Supports being used as a modal (parent controls visibility).
 *
 * Props:
 *  - initialData: optional object { id, name, is_global } for edit mode
 *  - onSaved: callback fired after successful create/update
 *  - onCancel: callback fired when user cancels
 *
 * Notes:
 *  - Keeps local loading state and prevents double submits.
 *  - Alerts on error (simple UX). Could be replaced by a toast system.
 */

import { useState, useEffect } from "react";
import { createCategory, updateCategory } from "../services/api";

const CategoryForm = ({ initialData = null, onSaved = () => {}, onCancel = () => {} }) => {
  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If parent changes initialData (e.g., open with different category), sync state.
    setName(initialData?.name || "");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        // Update existing category by id
        await updateCategory(initialData.id, { name });
      } else {
        // Create new category
        await createCategory({ name });
      }
      // Notify parent to refresh UI
      onSaved();
    } catch (err) {
      // Keep error handling simple for demo apps
      console.error("[CategoryForm] Error saving category:", err);
      alert("Could not save category. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2">
      <div className="col-9">
        <input
          className="form-control"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div className="col-3 d-flex gap-2">
        <button type="button" className="btn btn-link cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {isEdit ? (loading ? "Updating..." : "Update") : (loading ? "Saving..." : "Add")}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
