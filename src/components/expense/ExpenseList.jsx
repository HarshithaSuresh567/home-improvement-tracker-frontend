import { useState } from "react";
import ExpenseForm from "./ExpenseForm.jsx";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");
const val = (e) => Number(e.amount ?? e.cost ?? e.price ?? 0);
const titleOf = (e) => e.title || e.description || e.name || "Expense";

const ExpenseList = ({ expenses = [], onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);

  if (!expenses.length) return <p className="text-slate-500">No expenses yet.</p>;

  return (
    <div className="space-y-3">
      {expenses.map((e) => {
        const isEditing = editingId === e.id;
        return (
          <div key={e.id} className="card">
            {isEditing ? (
              <ExpenseForm
                initialValues={{
                  title: titleOf(e),
                  category: e.category || "other",
                  amount: val(e) || "",
                  purchasedAt: e.purchased_at || e.purchasedAt || e.date || e.expense_date || "",
                }}
                onSubmit={async (payload) => {
                  const ok = await onEdit?.(e.id, {
                    title: payload.title,
                    description: payload.title,
                    category: payload.category,
                    amount: payload.amount,
                    purchased_at: payload.purchasedAt,
                  });
                  if (ok) setEditingId(null);
                  return ok;
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{titleOf(e)}</p>
                  <p className="text-sm text-slate-600 capitalize">
                    {e.category || "other"} | {fmtDate(e.purchased_at || e.purchasedAt || e.date || e.expense_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">${val(e).toLocaleString()}</p>
                  <button className="rounded border px-2 py-1 text-sm" onClick={() => setEditingId(e.id)}>Edit</button>
                  <button
                    className="rounded border border-red-300 px-2 py-1 text-sm text-red-600"
                    onClick={() => onDelete?.(e.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;
