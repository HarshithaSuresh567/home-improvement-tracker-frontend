import { useState } from "react";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");

const TaskCard = ({ task, onSave, onDelete, onMarkComplete }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title || "",
    priority: task.priority || "medium",
    assignedTo: task.assigned_to || task.assignedTo || "",
    dueDate: task.deadline || task.due_date || task.dueDate || "",
    status: task.status || "pending",
  });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return;
    const updated = await onSave?.(task.id, {
      title: form.title.trim(),
      priority: form.priority,
      assigned_to: form.assignedTo || null,
      dueDate: form.dueDate || null,
      status: form.status,
    });
    if (!updated) return;
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card space-y-2">
        <input className="input" value={form.title} onChange={(e) => setField("title", e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <select className="input" value={form.priority} onChange={(e) => setField("priority", e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <input className="input" placeholder="Assigned To" value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)} />
        <input className="input" type="date" value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
        <div className="flex gap-2">
          <button className="btn-primary" onClick={save}>Save</button>
          <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="font-semibold">{task.title}</p>
      <p className="text-sm">Priority: {task.priority || "medium"}</p>
      <p className="text-sm">Assigned To: {task.assigned_to || task.assignedTo || "-"}</p>
      <p className="text-sm">Due Date: {fmtDate(task.deadline || task.due_date || task.dueDate)}</p>
      <p className="text-sm capitalize">Status: {task.status || "pending"}</p>

      <div className="mt-2 flex flex-wrap gap-2">
        <button className="rounded border px-2 py-1 text-sm" onClick={() => setEditing(true)}>Edit</button>
        <button className="rounded border px-2 py-1 text-sm" onClick={() => onMarkComplete?.(task.id)}>Mark Complete</button>
        <button className="rounded border border-red-300 px-2 py-1 text-sm text-red-600" onClick={() => onDelete?.(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
