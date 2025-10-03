// src/components/CategoryForm.jsx
import { useState, useEffect } from "react";
import { createCategory, updateCategory } from "../services/api";

/**
 * CategoryForm supports:
 * - initialData (object with id, name, optionally is_global)
 * - onSaved callback (called after successful create/update)
 * - onCancel callback
 */
const CategoryForm = ({ initialData = null, onSaved = () => {}, onCancel = () => {} }) => {
  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep form in sync if initialData changes
    setName(initialData?.name || "");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateCategory(initialData.id, { name });
      } else {
        await createCategory({ name });
      }
      onSaved();
    } catch (err) {
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
