import { useState } from "react";
import { CATEGORIES } from "../data";
import { useAppState } from "../context/AppStateContext";
import { menuAPI } from "../utils/api";
import type { MenuItem } from "../types";
import { AdminLayout } from "../components/AdminLayout";

/**
 * StocksManagement component for managing menu items, availability, and pricing.
 * 
 * TODO: All stock operations will be synced with backend API when integration is added.
 */
export const StocksManagement = () => {
  const { menuItems, setMenuItems, refreshMenu } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemCategory, setNewItemCategory] = useState<string>(CATEGORIES[0]?.id ?? "");
  const [newItemTag, setNewItemTag] = useState<MenuItem["tag"]>(undefined);

const startEdit = (item: MenuItem) => {
  setEditingId(item.id);
  setDraftName(item.name);
  setDraftPrice(item.price);
};

const saveEdit = async () => {
  if (!editingId) return;

  // Persist name/price changes via backend, then refresh menu to keep all clients in sync
  await handleUpdateItem(editingId, {
    name: draftName,
    price: draftPrice,
  });

  setEditingId(null);
};

  const handleAddNewItem = () => {
    if (!newItemName.trim() || newItemPrice <= 0 || !newItemCategory) {
      window.alert("Please fill in name, price, and category.");
      return;
    }
    const newId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: MenuItem = {
      id: newId,
      name: newItemName.trim(),
      description: newItemDesc.trim() || "No description",
      price: newItemPrice,
      categoryId: newItemCategory,
      isAvailable: true,
      tag: newItemTag
    };
    setMenuItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice(0);
    setNewItemCategory(CATEGORIES[0]?.id ?? "");
    setNewItemTag(undefined);
    setShowAddForm(false);
  };

  const handleUpdateItem = async (
    id: string,
    updates: Partial<Pick<MenuItem, "name" | "price" | "isAvailable">>
  ) => {
    try {
      // Update backend first
      await menuAPI.update(id, updates);
      
      // Optimistically update local state for immediate UI feedback
      setMenuItems((prev) =>
        prev.map((item) => {
          // Match by id (which could be _id or itemId)
          if (item.id === id) {
            return { ...item, ...updates };
          }
          return item;
        })
      );
      
      // Refresh menu from backend to ensure sync across all clients
      // This ensures customer menu also gets updated
      await refreshMenu();
    } catch (error) {
      console.error('Failed to update menu item:', error);
      window.alert('Failed to update menu item. Please try again.');
      // Refresh menu to revert any optimistic updates
      await refreshMenu();
    }
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AdminLayout>
      <div className="ms-admin-container">
        <section className="ms-panel ms-admin">
        <header className="ms-panel-header ms-admin-header">
          <div>
            <h1 className="ms-panel-title">Stocks Management</h1>
            <p className="ms-panel-subtitle">
              Control availability, pricing, and catalogue integrity.
            </p>
          </div>
          <div className="ms-admin-actions">
            <button
              type="button"
              className="ms-primary-cta"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "Add Items"}
            </button>
          </div>
        </header>

        {showAddForm && (
          <div className="ms-add-item-form">
            <h3 className="ms-admin-section-title">Add New Item</h3>
            <div className="ms-add-item-fields">
              <label className="ms-login-field">
                <span>Item Name</span>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Espresso Shot"
                />
              </label>
              <label className="ms-login-field">
                <span>Description</span>
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Brief description"
                />
              </label>
              <label className="ms-login-field">
                <span>Price (₹)</span>
                <input
                  type="number"
                  value={newItemPrice || ""}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </label>
              <label className="ms-login-field">
                <span>Category</span>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ms-login-field">
                <span>Tag (Optional)</span>
                <select
                  value={newItemTag || ""}
                  onChange={(e) =>
                    setNewItemTag(
                      e.target.value
                        ? (e.target.value as MenuItem["tag"])
                        : undefined
                    )
                  }
                >
                  <option value="">None</option>
                  <option value="Signature">Signature</option>
                  <option value="Chef's pick">Chef's pick</option>
                  <option value="New">New</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              className="ms-primary-cta"
              onClick={handleAddNewItem}
            >
              Add Item
            </button>
          </div>
        )}

        <div className="ms-stocks-groups">
          {CATEGORIES.map((category) => {
            const items = menuItems.filter((m) => m.categoryId === category.id);
            return (
              <div key={category.id} className="ms-stocks-block">
                <div className="ms-stocks-block-header">
                  <span className="ms-admin-section-title">{category.label}</span>
                  <span className="ms-stocks-count">{items.length} items</span>
                </div>
                {items.length === 0 && (
                  <div className="ms-admin-table-empty">No items in this category.</div>
                )}
                {items.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <div key={item.id} className="ms-stocks-row">
                      <div className="ms-stocks-main">
                        {isEditing ? (
                          <>
                            <input
                              value={draftName}
                              onChange={(e) => setDraftName(e.target.value)}
                              className="ms-stocks-input"
                            />
                            <input
                              type="number"
                              value={draftPrice}
                              onChange={(e) => setDraftPrice(Number(e.target.value))}
                              className="ms-stocks-input ms-stocks-input-small"
                            />
                          </>
                        ) : (
                          <>
                            <span className="ms-admin-stock-name">{item.name}</span>
                            <span className="ms-admin-stock-meta">₹ {item.price}</span>
                          </>
                        )}
                      </div>
                      <div className="ms-stocks-actions">
                        <span
                          className={
                            item.isAvailable ? "ms-chip ms-chip-ok" : "ms-chip ms-chip-off"
                          }
                        >
                          {item.isAvailable ? "In stock" : "Out of stock"}
                        </span>
                        <button
                          type="button"
                          className="ms-tertiary-cta"
                          onClick={() =>
                            handleUpdateItem(item.id, { isAvailable: !item.isAvailable })
                          }
                        >
                          Toggle
                        </button>
                        {isEditing ? (
                          <button
                            type="button"
                            className="ms-primary-cta"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ms-secondary-cta"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          className="ms-tertiary-cta"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </AdminLayout>
  );
};

