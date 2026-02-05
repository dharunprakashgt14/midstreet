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
  const [uploadingImageForId, setUploadingImageForId] = useState<string | null>(null);

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

  const handleAddNewItem = async () => {
    if (!newItemName.trim() || newItemPrice <= 0 || !newItemCategory) {
      window.alert("Please fill in name, price, and category.");
      return;
    }
    try {
      // Persist to backend first
      const created = await menuAPI.create({
        categoryId: newItemCategory,
        name: newItemName.trim(),
        description: newItemDesc.trim() || "No description",
        price: newItemPrice,
        isAvailable: true,
        tag: newItemTag,
      });

      // Refresh from backend so customer menu stays in sync
      await refreshMenu();

      // Reset form
      setNewItemName("");
      setNewItemDesc("");
      setNewItemPrice(0);
      setNewItemCategory(CATEGORIES[0]?.id ?? "");
      setNewItemTag(undefined);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add new menu item:', error);
      window.alert('Failed to add new item. Please try again.');
    }
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

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      // Delete from backend first
      await menuAPI.delete(id);

      // Optimistically remove from local state
      setMenuItems((prev) => prev.filter((item) => item.id !== id));

      // Ensure all clients stay in sync
      await refreshMenu();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      window.alert('Failed to delete item. Please try again.');
      await refreshMenu();
    }
  };

  /**
   * Upload an image to Cloudinary for a specific menu item and save URL in backend.
   * Frontend uploads directly to Cloudinary using unsigned upload preset, then
   * updates `imageUrl` via menuAPI.update so MongoDB and customer menu stay in sync.
   */
  const handleUploadImage = async (item: MenuItem, file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      window.alert("Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }

    try {
      setUploadingImageForId(item.id);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to upload image");
      }

      const data = await response.json();
      const secureUrl: string | undefined = data.secure_url || data.url;

      if (!secureUrl) {
        throw new Error("Cloudinary did not return an image URL");
      }

      // Save image URL into MongoDB via backend
      await menuAPI.update(item.id, { imageUrl: secureUrl });

      // Refresh menu so both admin and customer views get the new image
      await refreshMenu();
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      window.alert(`Failed to upload image. ${error?.message || ""}`);
    } finally {
      setUploadingImageForId(null);
    }
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
                        {/* Image upload button for this item */}
                        <label className="ms-secondary-cta" style={{ cursor: "pointer" }}>
                          {uploadingImageForId === item.id ? "Uploading..." : (item.imageUrl ? "Change image" : "Add image")}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadImage(item, file);
                                // Reset the input so the same file can be chosen again if needed
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
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

