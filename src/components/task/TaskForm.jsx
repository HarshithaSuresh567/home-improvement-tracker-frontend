import { useEffect, useMemo, useState } from "react";

const TaskForm = ({ onSubmit, projectId, members = [], currentUserName = "" }) => {
  const assignableMembers = useMemo(() => {
    const combined = [currentUserName, ...members]
      .map((m) => String(m || "").trim())
      .filter(Boolean);
    return Array.from(new Set(combined));
  }, [currentUserName, members]);

  const [form, setForm] = useState({
    title: "",
    priority: "medium",
    assignedTo: currentUserName || "",
    dueDate: "",
    status: "pending",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUserName) return;
    setForm((prev) => (prev.assignedTo ? prev : { ...prev, assignedTo: currentUserName }));
  }, [currentUserName]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!projectId) return setError("Missing project id.");
    if (!form.title.trim()) return setError("Task Name is required.");

    const created = await onSubmit?.({ ...form, projectId });
    if (!created) return setError("Task not added.");

    setForm({
      title: "",
      priority: "medium",
      assignedTo: currentUserName || "",
      dueDate: "",
      status: "pending",
    });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2 md:grid-cols-6">
      <input
        className="input md:col-span-2"
        placeholder="Task Name"
        value={form.title}
        onChange={(e) => setField("title", e.target.value)}
      />

      <select className="input" value={form.priority} onChange={(e) => setField("priority", e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {assignableMembers.length ? (
        <select className="input" value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)}>
          <option value="">Assign To</option>
          {assignableMembers.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          placeholder="Assigned To"
          value={form.assignedTo}
          onChange={(e) => setField("assignedTo", e.target.value)}
        />
      )}

      <input
        className="input"
        type="date"
        value={form.dueDate}
        onChange={(e) => setField("dueDate", e.target.value)}
      />

      <button type="submit" className="btn-primary">Add Task</button>
      {error && <p className="error md:col-span-6">{error}</p>}
    </form>
  );
};

export default TaskForm;
