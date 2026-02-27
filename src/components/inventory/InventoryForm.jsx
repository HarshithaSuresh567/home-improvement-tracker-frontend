import { useState } from "react";

const InventoryForm = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Item name is required");

    const created = await onSubmit?.({
      name: name.trim(),
      quantity: Number(quantity || 1),
    });

    if (!created) return setError("Inventory item not added");
    setName("");
    setQuantity("1");
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" min="1" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <button type="submit" className="btn-primary">Add Item</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default InventoryForm;
