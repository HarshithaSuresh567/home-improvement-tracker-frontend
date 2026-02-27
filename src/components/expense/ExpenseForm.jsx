import { useState } from "react";

const ExpenseForm = ({ onSubmit, initialValues = null, onCancel }) => {
  const [form, setForm] = useState(
    initialValues || {
      title: "",
      category: "material",
      amount: "",
      purchasedAt: "",
    }
  );
  const [error, setError] = useState("");

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Expense title is required.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Amount must be > 0.");

    const saved = await onSubmit?.({
      ...form,
      amount: Number(form.amount),
      title: form.title.trim(),
      purchasedAt: form.purchasedAt || null,
    });

    if (!saved) return setError("Expense save failed.");
    if (!initialValues) {
      setForm({ title: "", category: "material", amount: "", purchasedAt: "" });
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2 md:grid-cols-5">
      <input
        className="input md:col-span-2"
        placeholder="Expense title"
        value={form.title}
        onChange={(e) => setField("title", e.target.value)}
      />

      <select className="input" value={form.category} onChange={(e) => setField("category", e.target.value)}>
        <option value="material">Material</option>
        <option value="contractor">Contractor</option>
        <option value="other">Other</option>
      </select>

      <input
        className="input"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <input
        className="input"
        type="date"
        value={form.purchasedAt}
        onChange={(e) => setField("purchasedAt", e.target.value)}
      />

      <div className="md:col-span-5 flex gap-2">
        <button className="btn-primary" type="submit">
          {initialValues ? "Update Expense" : "Add Expense"}
        </button>
        {initialValues && (
          <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {error && <p className="error md:col-span-5">{error}</p>}
    </form>
  );
};

export default ExpenseForm;
