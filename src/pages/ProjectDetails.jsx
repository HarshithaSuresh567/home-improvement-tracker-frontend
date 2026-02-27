import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addContractor,
  addMaterial,
  addPermit,
  addPhoto,
  deleteContractor,
  deleteMaterial,
  deletePermit,
  deletePhoto,
  getContractorsByProject,
  getDesignIdeas,
  getMaterialsByProject,
  getPermitsByProject,
  getPhotosByProject,
  getProjectById,
  updateContractor,
  updateMaterial,
  updatePermit,
} from "../api/projectApi.js";

import TaskForm from "../components/task/TaskForm.jsx";
import TaskList from "../components/task/TaskList.jsx";
import TaskProgress from "../components/task/TaskProgress.jsx";
import { createTask, editTask, getTasks, markComplete, removeTask } from "../api/taskApi.js";

import ExpenseForm from "../components/expense/ExpenseForm.jsx";
import ExpenseList from "../components/expense/ExpenseList.jsx";
import ExpenseSummary from "../components/expense/ExpenseSummary.jsx";
import { createExpense, editExpense, getExpenses, removeExpense } from "../api/expenseApi.js";
import PhotoUpload from "../components/photo/PhotoUpload.jsx";
import PhotoGallery from "../components/photo/PhotoGallery.jsx";
import { useAuth } from "../hooks/useAuth.js";

const money = (n) => `$${Number(n || 0).toLocaleString()}`;
const dateText = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [permits, setPermits] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [materialForm, setMaterialForm] = useState({ name: "", estimatedPrice: "", actualCost: "" });
  const [contractorForm, setContractorForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [permitForm, setPermitForm] = useState({ name: "", status: "pending", approvalDate: "" });

  const loadAll = async ({ withLoader = false } = {}) => {
    if (!projectId) return;
    if (withLoader) setLoading(true);
    try {
      const [p, t, e, m, ph, c, pe] = await Promise.all([
        getProjectById(projectId),
        getTasks(projectId),
        getExpenses(projectId),
        getMaterialsByProject(projectId),
        getPhotosByProject(projectId),
        getContractorsByProject(projectId),
        getPermitsByProject(projectId),
      ]);
      setProject(p);
      setTasks(t || []);
      setExpenses(e || []);
      setMaterials(m || []);
      setPhotos(ph || []);
      setContractors(c || []);
      setPermits(pe || []);
    } finally {
      if (withLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadAll({ withLoader: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const projectType = project?.type || project?.title || "Kitchen Remodel";
    getDesignIdeas(projectType).then((data) => setIdeas(data || []));
  }, [project?.type, project?.title]);

  const spent = useMemo(
    () => expenses.reduce((sum, x) => sum + Number(x.amount ?? x.cost ?? x.price ?? 0), 0),
    [expenses]
  );
  const budget = Number(project?.budget || 0);
  const remaining = budget - spent;
  const budgetPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const currentUserName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    (user?.email ? String(user.email).split("@")[0] : "");

  const onAddTask = async (payload) => {
    const created = await createTask(payload);
    if (!created) return null;
    await loadAll();
    return created;
  };

  const onEditTask = async (taskId, patch) => {
    const updated = await editTask(taskId, patch);
    if (!updated) return null;
    await loadAll();
    return updated;
  };

  const onDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return false;
    const ok = await removeTask(taskId);
    if (ok) await loadAll();
    return ok;
  };

  const onMarkTaskComplete = async (taskId) => {
    const ok = await markComplete(taskId);
    if (ok) await loadAll();
    return ok;
  };

  const onAddExpense = async (payload) => {
    const created = await createExpense({ ...payload, projectId });
    if (!created) return null;
    await loadAll();
    return created;
  };

  const onEditExpense = async (expenseId, patch) => {
    const updated = await editExpense(expenseId, patch);
    if (!updated) return null;
    await loadAll();
    return updated;
  };

  const onDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return false;
    const ok = await removeExpense(expenseId);
    if (ok) await loadAll();
    return ok;
  };

  const submitMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.name.trim()) return;
    const created = await addMaterial({
      projectId,
      name: materialForm.name.trim(),
      unitCost: Number(materialForm.estimatedPrice || 0),
      quantity: 1,
      purchased: false,
      actualCost: Number(materialForm.actualCost || 0),
    });
    if (created) {
      setMaterialForm({ name: "", estimatedPrice: "", actualCost: "" });
      await loadAll();
    }
  };

  const togglePurchased = async (item) => {
    await updateMaterial(item.id, { purchased: !item.purchased });
    await loadAll();
  };

  const updateMaterialCost = async (item, actualCost) => {
    await updateMaterial(item.id, { actual_cost: Number(actualCost || 0), unit_cost: Number(actualCost || 0) });
    await loadAll();
  };

  const submitPhoto = async (payload) => {
    const created = await addPhoto({ ...payload, projectId });
    if (!created) return null;
    await loadAll();
    return created;
  };

  const removePhotoItem = async (id) => {
    if (!window.confirm("Delete photo?")) return;
    await deletePhoto(id);
    await loadAll();
  };

  const submitContractor = async (e) => {
    e.preventDefault();
    if (!contractorForm.name.trim()) return;
    const created = await addContractor({ ...contractorForm, projectId, name: contractorForm.name.trim() });
    if (created) {
      setContractors((prev) => [created, ...prev]);
      setContractorForm({ name: "", phone: "", email: "", notes: "" });
    } else {
      console.error("Contractor add failed.");
    }
  };

  const saveContractorNotes = async (item, notes) => {
    await updateContractor(item.id, { notes });
    await loadAll();
  };

  const removeContractorItem = async (id) => {
    if (!window.confirm("Delete contractor?")) return;
    await deleteContractor(id);
    await loadAll();
  };

  const submitPermit = async (e) => {
    e.preventDefault();
    if (!permitForm.name.trim()) return;
    const created = await addPermit({
      projectId,
      name: permitForm.name.trim(),
      status: permitForm.status,
      approvalDate: permitForm.approvalDate || null,
    });
    if (created) {
      setPermits((prev) => [created, ...prev]);
      setPermitForm({ name: "", status: "pending", approvalDate: "" });
    } else {
      console.error("Permit add failed.");
    }
  };

  const updatePermitStatus = async (item, status) => {
    await updatePermit(item.id, { status });
    await loadAll();
  };

  const removePermitItem = async (id) => {
    if (!window.confirm("Delete permit?")) return;
    await deletePermit(id);
    await loadAll();
  };

  if (loading) return <div className="page-loader">Loading project...</div>;
  if (!project) return <div className="error">Project not found.</div>;

  return (
    <div className="project-details">
      <h1 className="text-3xl font-bold">{project.title || "Project"}</h1>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Project Info</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-slate-500">Project Name</p>
            <p className="font-semibold">{project.title || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-semibold capitalize">{project.status || "planning"}</p>
          </div>
          <div>
            <p className="text-slate-500">Description</p>
            <p className="font-semibold">{project.description || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Start Date</p>
            <p className="font-semibold">{dateText(project.start_date)}</p>
          </div>
          <div>
            <p className="text-slate-500">Deadline</p>
            <p className="font-semibold">{dateText(project.end_date)}</p>
          </div>
          <div>
            <p className="text-slate-500">Total Budget</p>
            <p className="font-semibold">{money(budget)}</p>
          </div>
          <div>
            <p className="text-slate-500">Amount Spent</p>
            <p className="font-semibold">{money(spent)}</p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Budget Usage</span>
            <span>{budgetPct}%</span>
          </div>
          <div className="h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-blue-600" style={{ width: `${budgetPct}%` }} />
          </div>
          <p className={`mt-2 text-sm ${remaining < 0 ? "text-red-600" : "text-slate-600"}`}>
            Remaining: {money(remaining)}
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <TaskForm
          projectId={projectId}
          onSubmit={onAddTask}
          currentUserName={currentUserName}
          members={["Family Member", "Contractor", "Designer"]}
        />
        <TaskProgress tasks={tasks} />
        <TaskList
          tasks={tasks}
          onSave={onEditTask}
          onDelete={onDeleteTask}
          onMarkComplete={onMarkTaskComplete}
        />
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Budget & Expenses</h2>
        <ExpenseForm onSubmit={onAddExpense} />
        <ExpenseSummary expenses={expenses} budget={budget} />
        <ExpenseList expenses={expenses} onEdit={onEditExpense} onDelete={onDeleteExpense} />
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Materials</h2>
        <form onSubmit={submitMaterial} className="inline-form">
          <input
            className="input"
            placeholder="Material Name"
            value={materialForm.name}
            onChange={(e) => setMaterialForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Estimated Price"
            value={materialForm.estimatedPrice}
            onChange={(e) => setMaterialForm((p) => ({ ...p, estimatedPrice: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Actual Cost"
            value={materialForm.actualCost}
            onChange={(e) => setMaterialForm((p) => ({ ...p, actualCost: e.target.value }))}
          />
          <button className="btn-primary" type="submit">
            Add Material
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2">Material</th>
                <th className="py-2">Estimated</th>
                <th className="py-2">Purchased</th>
                <th className="py-2">Actual Cost</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-2">{m.name}</td>
                  <td className="py-2">{money(m.estimated_price ?? m.unit_cost)}</td>
                  <td className="py-2">
                    <input type="checkbox" checked={!!m.purchased} onChange={() => togglePurchased(m)} />
                  </td>
                  <td className="py-2">
                    <input
                      className="input"
                      style={{ minWidth: 120 }}
                      type="number"
                      defaultValue={m.actual_cost ?? m.unit_cost ?? 0}
                      onBlur={(e) => updateMaterialCost(m, e.target.value)}
                    />
                  </td>
                  <td className="py-2">
                    <button className="btn-ghost btn-sm" onClick={() => deleteMaterial(m.id).then(loadAll)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!materials.length && (
                <tr>
                  <td colSpan="5" className="py-3 text-slate-500">
                    No materials added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Photos</h2>
        <PhotoUpload onSubmit={submitPhoto} />
        <PhotoGallery photos={photos} onDelete={removePhotoItem} />
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Contractors</h2>
        <form onSubmit={submitContractor} className="inline-form">
          <input
            className="input"
            placeholder="Name"
            value={contractorForm.name}
            onChange={(e) => setContractorForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Phone"
            value={contractorForm.phone}
            onChange={(e) => setContractorForm((p) => ({ ...p, phone: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Email"
            value={contractorForm.email}
            onChange={(e) => setContractorForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Notes"
            value={contractorForm.notes}
            onChange={(e) => setContractorForm((p) => ({ ...p, notes: e.target.value }))}
          />
          <button className="btn-primary" type="submit">
            Add Contractor
          </button>
        </form>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {contractors.map((c) => (
            <div key={c.id} className="card">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-slate-500">{c.phone || "-"}</p>
              <p className="text-sm text-slate-500">{c.email || "-"}</p>
              <textarea
                className="input mt-2"
                defaultValue={c.notes || ""}
                onBlur={(e) => saveContractorNotes(c, e.target.value)}
              />
              <button className="btn-ghost btn-sm mt-2" onClick={() => removeContractorItem(c.id)}>
                Delete
              </button>
            </div>
          ))}
          {!contractors.length && <p className="text-slate-500">No contractors added.</p>}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold">Permits & Regulations</h2>
        <form onSubmit={submitPermit} className="inline-form">
          <input
            className="input"
            placeholder="Permit Name"
            value={permitForm.name}
            onChange={(e) => setPermitForm((p) => ({ ...p, name: e.target.value }))}
          />
          <select
            className="input"
            value={permitForm.status}
            onChange={(e) => setPermitForm((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            className="input"
            type="date"
            value={permitForm.approvalDate}
            onChange={(e) => setPermitForm((p) => ({ ...p, approvalDate: e.target.value }))}
          />
          <button className="btn-primary" type="submit">
            Add Permit
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2">Permit</th>
                <th className="py-2">Status</th>
                <th className="py-2">Approval Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permits.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">
                    <select
                      className="input"
                      value={p.status || "pending"}
                      onChange={(e) => updatePermitStatus(p, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="py-2">{dateText(p.approval_date || p.approvalDate)}</td>
                  <td className="py-2">
                    <button className="btn-ghost btn-sm" onClick={() => removePermitItem(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!permits.length && (
                <tr>
                  <td colSpan="4" className="py-3 text-slate-500">
                    No permits added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-2">
        <h2 className="text-2xl font-semibold">Inspiration & Tips</h2>
        {ideas.map((idea, idx) => (
          <p key={`${idea}-${idx}`} className="text-sm text-slate-600">
            - {idea}
          </p>
        ))}
      </section>
    </div>
  );
};

export default ProjectDetails;

