import { useEffect, useState } from "react";
import {
  addInventoryItem,
  deleteInventoryItem,
  getInventory,
  updateInventoryItem,
} from "../api/projectApi.js";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "1" });
  const [loading, setLoading] = useState(false);

  const load = async ({ withLoader = false } = {}) => {
    if (withLoader) setLoading(true);
    const data = await getInventory();
    setItems(data || []);
    if (withLoader) setLoading(false);
  };

  useEffect(() => {
    load({ withLoader: true });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const created = await addInventoryItem({
      name: form.name.trim(),
      quantity: Number(form.quantity || 1),
      projectId: null,
    });
    if (created) {
      setItems((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
      setForm({ name: "", quantity: "1" });
      load();
    }
  };

  const toggleUsed = async (item) => {
    const used = !(item.used || item.is_used);
    await updateInventoryItem(item.id, { used, is_used: used });
    setItems((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, used, is_used: used } : x))
    );
    load();
  };

  const updateQty = async (item, quantity) => {
    const nextQty = Number(quantity || 0);
    await updateInventoryItem(item.id, { quantity: nextQty });
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, quantity: nextQty } : x)));
    load();
  };

  const removeItem = async (id) => {
    if (!window.confirm("Delete item?")) return;
    await deleteInventoryItem(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    load();
  };

  return (
    <div className="projects-container">
      <h1 className="text-3xl font-bold">Inventory</h1>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Tools and Materials Owned</h2>
        <form onSubmit={submit} className="inline-form">
          <input
            className="input"
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          />
          <button type="submit" className="btn-primary">
            Add Item
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Inventory List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2">Item</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Used</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">
                      <input
                        className="input"
                        style={{ minWidth: 100 }}
                        type="number"
                        min="0"
                        defaultValue={item.quantity || 0}
                        onBlur={(e) => updateQty(item, e.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={!!(item.used || item.is_used)}
                        onChange={() => toggleUsed(item)}
                      />
                    </td>
                    <td className="py-2">
                      <button className="btn-ghost btn-sm" onClick={() => removeItem(item.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan="4">
                      No inventory items added.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Inventory;

