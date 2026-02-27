import { useState } from "react";
import TaskCard from "./TaskCard";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");

const TaskList = ({ tasks = [], onSave, onDelete, onMarkComplete }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    status: "pending",
  });

  const startEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      priority: task.priority || "medium",
      assignedTo: task.assigned_to || task.assignedTo || "",
      dueDate: task.deadline || task.due_date || task.dueDate || "",
      status: task.status || "pending",
    });
  };

  const saveEdit = async (taskId) => {
    if (!form.title.trim()) return;
    const saved = await onSave?.(taskId, {
      title: form.title.trim(),
      priority: form.priority,
      assignedTo: form.assignedTo || null,
      dueDate: form.dueDate || null,
      status: form.status,
    });
    if (saved) setEditingId(null);
  };

  if (!tasks.length) return <p className="text-slate-500">No tasks yet.</p>;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Task Name</th>
              <th className="py-2">Priority</th>
              <th className="py-2">Assigned To</th>
              <th className="py-2">Due Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const isEditing = editingId === t.id;
              return (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2">
                    {isEditing ? (
                      <input
                        className="input"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      />
                    ) : (
                      t.title
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <select
                        className="input"
                        value={form.priority}
                        onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      t.priority || "medium"
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <input
                        className="input"
                        value={form.assignedTo}
                        onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                      />
                    ) : (
                      t.assigned_to || t.assignedTo || "-"
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <input
                        className="input"
                        type="date"
                        value={form.dueDate || ""}
                        onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                      />
                    ) : (
                      fmtDate(t.deadline || t.due_date || t.dueDate)
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <select
                        className="input"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <span className="capitalize">{t.status || "pending"}</span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <button className="btn-ghost btn-sm" onClick={() => saveEdit(t.id)}>
                            Save
                          </button>
                          <button className="btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-ghost btn-sm" onClick={() => startEdit(t)}>
                            Edit
                          </button>
                          <button className="btn-ghost btn-sm" onClick={() => onMarkComplete?.(t.id)}>
                            Mark Complete
                          </button>
                          <button className="btn-ghost btn-sm" onClick={() => onDelete?.(t.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSave={onSave}
            onDelete={onDelete}
            onMarkComplete={onMarkComplete}
          />
        ))}
      </div>
    </>
  );
};

export default TaskList;
