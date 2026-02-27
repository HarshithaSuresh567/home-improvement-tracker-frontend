import { useEffect, useState } from "react";
import {
  addMaintenanceTask,
  getMaintenanceTasks,
  updateMaintenanceTask,
} from "../api/projectApi.js";

const Maintenance = () => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", dueDate: "", reminder: "monthly" });
  const [error, setError] = useState("");

  const load = async () => setTasks((await getMaintenanceTasks()) || []);

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return;
    const created = await addMaintenanceTask({
      title: form.title.trim(),
      due_date: form.dueDate || null,
      dueDate: form.dueDate || null,
      frequency: form.reminder,
      status: "pending",
    });
    if (!created) {
      setError("Maintenance task not added.");
      return;
    }
    setTasks((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
    setForm({ title: "", dueDate: "", reminder: "monthly" });
    await load();
  };

  const toggle = async (task) => {
    const status = String(task.status || "").toLowerCase() === "completed" ? "pending" : "completed";
    const updated = await updateMaintenanceTask(task.id, { status });
    if (!updated) return;
    setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, status } : x)));
    await load();
  };

  return (
    <div className="projects-container">
      <h1 className="text-3xl font-bold">Maintenance Schedule</h1>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Add Maintenance Task</h2>
        <form className="inline-form" onSubmit={submit}>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="HVAC servicing, roof inspection, seasonal yard work..."
          />
          <input
            className="input"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
          />
          <select
            className="input"
            value={form.reminder}
            onChange={(e) => setForm((p) => ({ ...p, reminder: e.target.value }))}
          >
            <option value="weekly">Weekly Reminder</option>
            <option value="monthly">Monthly Reminder</option>
            <option value="quarterly">Quarterly Reminder</option>
            <option value="yearly">Yearly Reminder</option>
          </select>
          <button className="btn-primary" type="submit">
            Add
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Upcoming Maintenance</h2>
        {!tasks.length ? (
          <p className="text-slate-500">No maintenance tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-slate-500">
                  Due:{" "}
                  {t.due_date || t.dueDate ? new Date(t.due_date || t.dueDate).toLocaleDateString() : "Not set"}{" "}
                  | Reminder: {t.frequency || "monthly"} | Status: {t.status || "pending"}
                </p>
                <button className="btn-ghost btn-sm mt-2" onClick={() => toggle(t)}>
                  Mark {String(t.status || "").toLowerCase() === "completed" ? "Pending" : "Completed"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Maintenance;

