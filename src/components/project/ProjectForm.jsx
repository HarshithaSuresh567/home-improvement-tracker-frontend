import { useEffect, useMemo, useState } from "react";
import { addProject, getTemplates, updateProject } from "../../api/projectApi.js";

const ProjectForm = ({ initialData = null, onClose, onSaved }) => {
  const isEdit = !!initialData;
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const initialForm = useMemo(
    () => ({
      name: initialData?.title || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      startDate: initialData?.start_date || "",
      endDate: initialData?.end_date || "",
      targetBudget: initialData?.budget ?? "",
      status: initialData?.status || "planning",
    }),
    [initialData]
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const applyTemplate = (id) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setForm((p) => ({
      ...p,
      name: p.name || t.name,
      targetBudget: p.targetBudget || t.defaultBudget,
      type: t.name,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanName = form.name.trim();
    const budgetValue = Number(form.targetBudget || 0);

    if (!cleanName) {
      setError("Project name is required.");
      return;
    }
    if (Number.isNaN(budgetValue) || budgetValue < 0) {
      setError("Budget must be a valid non-negative number.");
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError("End date must be on or after the start date.");
      return;
    }

    let result = null;
    setSaving(true);

    try {
      if (isEdit) {
        result = await updateProject(initialData.id, {
          title: cleanName,
          description: form.description || null,
          location: form.location || null,
          budget: budgetValue,
          start_date: form.startDate || null,
          end_date: form.endDate || null,
          status: String(form.status || "planning").toLowerCase(),
        });
      } else {
        result = await addProject({
          ...form,
          name: cleanName,
          targetBudget: budgetValue,
        });
      }

      if (!result) {
        setError("Save failed. Check console for Supabase error.");
        return;
      }

      await onSaved?.(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal">
      <h2 className="mb-3 text-xl font-semibold">{isEdit ? "Edit Project" : "New Project"}</h2>
      {error && <p className="error mb-2">{error}</p>}

      <form onSubmit={submit} className="stack">
        {!isEdit && (
          <select className="input" onChange={(e) => applyTemplate(e.target.value)} defaultValue="">
            <option value="">Use Template (optional)</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}

        <input className="input" placeholder="Project name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
        <input className="input" placeholder="Project type" value={form.type} onChange={(e) => setField("type", e.target.value)} />
        <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
        <input className="input" placeholder="Location" value={form.location} onChange={(e) => setField("location", e.target.value)} />
        <input className="input" type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} />
        <input className="input" type="date" value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} />
        <input className="input" type="number" placeholder="Budget" value={form.targetBudget} onChange={(e) => setField("targetBudget", e.target.value)} />

        <select className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <div className="mt-2 flex gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </button>
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm" onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
