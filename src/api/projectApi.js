import { supabase } from "../config/supabase.js";
import API from "./axios.js";

const TABLES = {
  projects: "projects",
  tasks: "tasks",
  expenses: "expenses",
  photos: "project_photos",
  materials: "materials",
  contractors: "contractors",
  inventory: "inventory",
  permits: "permits",
  maintenance: "maintenance",
};

const templates = [
  { id: "kitchen-remodel", name: "Kitchen Remodel", defaultBudget: 12000 },
  { id: "bathroom-update", name: "Bathroom Update", defaultBudget: 7000 },
  { id: "bedroom-update", name: "Bedroom Update", defaultBudget: 5000 },
  { id: "living-room-makeover", name: "Living Room Makeover", defaultBudget: 6000 },
  { id: "painting-interior", name: "Interior Painting", defaultBudget: 2500 },
  { id: "flooring-upgrade", name: "Flooring Upgrade", defaultBudget: 8000 },
  { id: "lighting-upgrade", name: "Lighting Upgrade", defaultBudget: 2200 },
  { id: "electrical-upgrade", name: "Electrical Upgrade", defaultBudget: 4500 },
  { id: "plumbing-upgrade", name: "Plumbing Upgrade", defaultBudget: 4000 },
  { id: "roof-repair", name: "Roof Repair", defaultBudget: 9000 },
  { id: "garden-revamp", name: "Garden Revamp", defaultBudget: 3500 },
  { id: "home-office-setup", name: "Home Office Setup", defaultBudget: 3000 },
  { id: "garage-organization", name: "Garage Organization", defaultBudget: 1800 },
  { id: "landscaping", name: "Landscaping", defaultBudget: 4000 },
];

const ideasByType = {
  "Kitchen Remodel": ["Use under-cabinet lighting.", "Pick quartz for low maintenance."],
  "Bathroom Update": ["Use large-format tiles.", "Add recessed storage niche."],
  "Bedroom Update": ["Use layered lighting for comfort.", "Prioritize built-in storage to reduce clutter."],
  "Living Room Makeover": ["Anchor the room with a focal wall.", "Use layered lights for flexible mood."],
  "Interior Painting": ["Test paint swatches in natural light.", "Use washable finishes in high-traffic areas."],
  "Flooring Upgrade": ["Pick durable materials for pets/kids.", "Order 10% extra material for cuts and waste."],
  "Lighting Upgrade": ["Combine ambient, task, and accent lights.", "Install dimmers for energy savings."],
  "Electrical Upgrade": ["Plan outlet locations around furniture layout.", "Upgrade panel capacity if adding heavy loads."],
  "Plumbing Upgrade": ["Choose water-efficient fixtures.", "Check shutoff valve access before installation."],
  "Roof Repair": ["Inspect flashing around vents and chimneys.", "Prioritize leak-source fixes before interior repairs."],
  "Garden Revamp": ["Use native plants for lower maintenance.", "Group plants by watering needs."],
  "Home Office Setup": ["Prioritize ergonomic desk and chair setup.", "Plan cable management before final placement."],
  "Garage Organization": ["Use vertical wall storage.", "Zone tools by task frequency."],
  Landscaping: ["Use native plants.", "Install drip irrigation."],
};

const logErr = (label, error) => {
  if (error) console.error(`${label}:`, error);
};

const backendEnabled = import.meta.env.VITE_USE_BACKEND !== "false";

const backendCall = async (label, fn) => {
  if (!backendEnabled) return null;
  try {
    return await fn();
  } catch (error) {
    logErr(`${label}.backend`, error);
    return null;
  }
};

const LOCAL_PHOTOS_KEY = "renovatrack_local_photos";
const LOCAL_CONTRACTORS_KEY = "renovatrack_local_contractors";
const LOCAL_PERMITS_KEY = "renovatrack_local_permits";
const LOCAL_INVENTORY_KEY = "renovatrack_local_inventory";
const LOCAL_MAINTENANCE_KEY = "renovatrack_local_maintenance";
const readLocalPhotos = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PHOTOS_KEY) || "[]");
  } catch {
    return [];
  }
};
const readLocalContractors = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CONTRACTORS_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeLocalContractors = (rows) => {
  try {
    localStorage.setItem(LOCAL_CONTRACTORS_KEY, JSON.stringify(rows));
  } catch {
    // Ignore localStorage write failures.
  }
};
const writeLocalPhotos = (rows) => {
  try {
    localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(rows));
  } catch {
    // Ignore localStorage write failures.
  }
};
const readLocalPermits = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PERMITS_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeLocalPermits = (rows) => {
  try {
    localStorage.setItem(LOCAL_PERMITS_KEY, JSON.stringify(rows));
  } catch {
    // Ignore localStorage write failures.
  }
};
const readLocalInventory = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_INVENTORY_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeLocalInventory = (rows) => {
  try {
    localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(rows));
  } catch {
    // Ignore localStorage write failures.
  }
};
const readLocalMaintenance = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_MAINTENANCE_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeLocalMaintenance = (rows) => {
  try {
    localStorage.setItem(LOCAL_MAINTENANCE_KEY, JSON.stringify(rows));
  } catch {
    // Ignore localStorage write failures.
  }
};

const getCurrentUserId = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) return userData.user.id;

  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session?.user?.id || null;
};

const updateById = async (table, id, payload) => {
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select().single();
  if (error) {
    logErr(`${table}.update`, error);
    return null;
  }
  return data;
};

const deleteById = async (table, id) => {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    logErr(`${table}.delete`, error);
    return false;
  }
  return true;
};

const byProject = async (table, projectId) => {
  if (!projectId) return [];

  const projectKeys = ["project_id", "projectId", "project", "initiative_id"];

  for (const key of projectKeys) {
    let res = await supabase.from(table).select("*").eq(key, projectId);

    if (!res.error) {
      const rows = res.data || [];
      // Sort locally if created_at exists; avoids PostgREST 400 when column is missing.
      rows.sort((a, b) => {
        if (!a?.created_at || !b?.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return rows;
    }
  }

  logErr(`${table}.byProject`, { message: "Could not match project key", projectId });
  return [];
};

const tryInsert = async (table, payloads) => {
  for (const payload of payloads) {
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    if (!error) return data;
    console.error(`${table}.insert failed with payload:`, payload, {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
  }
  return null;
};

// =========================
// Projects
// =========================
export const getProjects = async () => {
  const fromBackend = await backendCall("projects.get", async () => {
    const res = await API.get("/projects");
    return res.data || [];
  });
  if (fromBackend) return fromBackend;

  const { data, error } = await supabase
    .from(TABLES.projects)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logErr("projects.get", error);
    return [];
  }
  return data || [];
};

export const getProjectById = async (id) => {
  const fromBackend = await backendCall("projects.getById", async () => {
    const res = await API.get(`/projects/${id}`);
    return res.data || null;
  });
  if (fromBackend) return fromBackend;

  const { data, error } = await supabase.from(TABLES.projects).select("*").eq("id", id).single();
  if (error) {
    logErr("projects.getById", error);
    return null;
  }
  return data;
};

export const addProject = async (projectData) => {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const title = (projectData.title || projectData.name || "").trim();
  if (!title) return null;

  const row = {
    user_id: userId,
    title,
    description: projectData.description || null,
    location: projectData.location || null,
    budget: Number(projectData.budget ?? projectData.targetBudget ?? 0),
    start_date: projectData.start_date || projectData.startDate || null,
    end_date: projectData.end_date || projectData.endDate || null,
    status: String(projectData.status || "planning").toLowerCase(),
  };

  const fromBackend = await backendCall("projects.add", async () => {
    const res = await API.post("/projects", row);
    return res.data?.project || null;
  });
  if (fromBackend) return fromBackend;

  const { data, error } = await supabase.from(TABLES.projects).insert([row]).select().single();
  if (error) {
    logErr("projects.add", error);
    return null;
  }
  return data;
};

export const updateProject = async (id, patch) => {
  const normalized = { ...patch };
  if (normalized.startDate !== undefined) {
    normalized.start_date = normalized.startDate;
    delete normalized.startDate;
  }
  if (normalized.endDate !== undefined) {
    normalized.end_date = normalized.endDate;
    delete normalized.endDate;
  }
  if (normalized.targetBudget !== undefined) {
    normalized.budget = Number(normalized.targetBudget || 0);
    delete normalized.targetBudget;
  }
  if (normalized.name !== undefined) {
    normalized.title = normalized.name;
    delete normalized.name;
  }

  const fromBackend = await backendCall("projects.update", async () => {
    const res = await API.put(`/projects/${id}`, normalized);
    return res.data?.project || null;
  });
  if (fromBackend) return fromBackend;

  return updateById(TABLES.projects, id, normalized);
};

export const deleteProject = async (id) => {
  const fromBackend = await backendCall("projects.delete", async () => {
    await API.delete(`/projects/${id}`);
    return true;
  });
  if (fromBackend) return true;
  return deleteById(TABLES.projects, id);
};

// =========================
// Templates / Design ideas
// =========================
export const getTemplates = async () => templates;
export const getDesignIdeas = async (type) =>
  ideasByType[type] || ["Browse local design boards for inspiration."];

// =========================
// Tasks
// =========================
export const getTasksByProject = async (projectId) => {
  const fromBackend = await backendCall("tasks.getByProject", async () => {
    const res = await API.get(`/tasks/project/${projectId}`);
    return res.data || [];
  });
  const rows = fromBackend || (await byProject(TABLES.tasks, projectId));
  return (rows || []).map((t) => ({
    ...t,
    dueDate: t.deadline || t.due_date || t.dueDate || null,
    assignedTo: t.assigned_to || t.assignedTo || "",
  }));
};

export const addTask = async ({ projectId, title, priority, assignedTo, dueDate, status }) => {
  if (!projectId || !title?.trim()) return null;

  const userId = await getCurrentUserId();
  const t = title.trim();
  const p = (priority || "medium").toLowerCase();
  const s = (status || "pending").toLowerCase();
  const a = assignedTo || null;
  const d = dueDate || null;

  const fromBackend = await backendCall("tasks.add", async () => {
    const res = await API.post("/tasks", {
      project_id: projectId,
      title: t,
      description: t,
      priority: p,
      assigned_to: a,
      deadline: d,
      status: s,
    });
    return res.data?.task || null;
  });
  if (fromBackend) return fromBackend;

  return await tryInsert(TABLES.tasks, [
    { project_id: projectId, title: t, description: t, priority: p, assigned_to: a, deadline: d, status: s, user_id: userId },
    { project_id: projectId, title: t, description: t, priority: p, assigned_to: a, deadline: d, status: s },
    { project_id: projectId, title: t, priority: p, assigned_to: a, due_date: d, status: s, user_id: userId },
    { project_id: projectId, title: t, priority: p, assigned_to: a, due_date: d, status: s },
    { projectId, title: t, priority: p, assignedTo: a, dueDate: d, status: s, user_id: userId },
    { project_id: projectId, title: t, status: s },
    { projectId, title: t, status: s },
  ]);
};

export const updateTask = async (id, patch) => {
  const normalized = { ...patch };

  if (normalized.dueDate !== undefined) {
    normalized.deadline = normalized.dueDate;
    delete normalized.dueDate;
  }
  if (normalized.assignedTo !== undefined) {
    normalized.assigned_to = normalized.assignedTo;
    delete normalized.assignedTo;
  }

  const fromBackend = await backendCall("tasks.update", async () => {
    const res = await API.put(`/tasks/${id}`, normalized);
    return res.data?.task || null;
  });
  if (fromBackend) return fromBackend;

  let updated = await updateById(TABLES.tasks, id, normalized);
  if (updated) return updated;

  const fallback = { ...patch };
  if (fallback.dueDate !== undefined) {
    fallback.due_date = fallback.dueDate;
    delete fallback.dueDate;
  }
  return updateById(TABLES.tasks, id, fallback);
};

export const deleteTask = async (id) => {
  const fromBackend = await backendCall("tasks.delete", async () => {
    await API.delete(`/tasks/${id}`);
    return true;
  });
  if (fromBackend) return true;
  return deleteById(TABLES.tasks, id);
};

// =========================
// Expenses
// =========================
export const getExpensesByProject = async (projectId) => {
  const fromBackend = await backendCall("expenses.getByProject", async () => {
    const res = await API.get(`/expenses/project/${projectId}`);
    return res.data || [];
  });
  if (fromBackend) return fromBackend;
  return byProject(TABLES.expenses, projectId);
};

export const addExpense = async ({ projectId, title, amount, category, purchasedAt }) => {
  if (!projectId || !title?.trim()) return null;

  const userId = await getCurrentUserId();

  const t = title.trim();
  const amt = Number(amount || 0);
  const c = String(category || "other").toLowerCase();
  const dt = purchasedAt || null;

  const fromBackend = await backendCall("expenses.add", async () => {
    const res = await API.post("/expenses", {
      project_id: projectId,
      amount: amt,
      title: t,
      category: c,
      purchased_at: dt,
    });
    return res.data?.expense || null;
  });
  if (fromBackend) return fromBackend;

  const payloads = [
    // Backend-compatible primary payloads
    { project_id: projectId, amount: amt, description: t, user_id: userId },
    { project_id: projectId, amount: amt, description: t },
    { projectId, amount: amt, description: t, user_id: userId },
    { projectId, amount: amt, description: t },

    { project_id: projectId, title: t, amount: amt, category: c, purchased_at: dt, user_id: userId },
    { project_id: projectId, title: t, amount: amt, category: c, purchased_at: dt },
    { project_id: projectId, title: t, amount: amt, user_id: userId },
    { projectId, title: t, amount: amt, category: c, purchasedAt: dt },
    { projectId, title: t, amount: amt, user_id: userId },
    { project_id: projectId, title: t, amount: amt },
    { projectId, title: t, amount: amt },

    // Wider schema compatibility fallbacks
    { project: projectId, title: t, amount: amt, category: c, purchased_at: dt },
    { initiative_id: projectId, title: t, amount: amt, category: c, purchased_at: dt },
    { project_id: projectId, expense_title: t, cost: amt, category: c, expense_date: dt, user_id: userId },
    { project_id: projectId, name: t, cost: amt, category: c, date: dt, user_id: userId },
    { project: projectId, expense_title: t, cost: amt, date: dt },
    { initiative_id: projectId, name: t, price: amt, date: dt },
    { title: t, amount: amt, user_id: userId },
    { title: t, amount: amt },
    { name: t, cost: amt },
  ];

  const saved = await tryInsert(TABLES.expenses, payloads);
  if (!saved) {
    console.error("addExpense failed for all payload variants. Check RLS policy and expenses columns.");
  }
  return saved;
};

export const updateExpense = async (id, patch) => {
  const normalized = { ...patch };
  if (normalized.purchasedAt !== undefined) {
    normalized.purchased_at = normalized.purchasedAt;
    delete normalized.purchasedAt;
  }
  if (normalized.title !== undefined && normalized.description === undefined) {
    normalized.description = normalized.title;
  }

  const fromBackend = await backendCall("expenses.update", async () => {
    const res = await API.put(`/expenses/${id}`, normalized);
    return res.data?.expense || null;
  });
  if (fromBackend) return fromBackend;

  let updated = await updateById(TABLES.expenses, id, normalized);
  if (updated) return updated;

  const fallback = { ...patch };
  if (fallback.title !== undefined && fallback.description === undefined) {
    fallback.description = fallback.title;
  }
  return updateById(TABLES.expenses, id, fallback);
};

export const deleteExpense = async (id) => {
  const fromBackend = await backendCall("expenses.delete", async () => {
    await API.delete(`/expenses/${id}`);
    return true;
  });
  if (fromBackend) return true;
  return deleteById(TABLES.expenses, id);
};

// =========================
// Photos
// =========================
export const getPhotosByProject = async (projectId) => {
  const fromBackend = await backendCall("photos.getByProject", async () => {
    const res = await API.get(`/photos/project/${projectId}`);
    return res.data || [];
  });
  const remote = fromBackend || (await byProject(TABLES.photos, projectId));
  const local = readLocalPhotos().filter((x) => x.project_id === projectId);
  return [...local, ...(remote || [])];
};

export const addPhoto = async ({ projectId, url, stage = "progress" }) => {
  const userId = await getCurrentUserId();
  const cleanUrl = String(url || "").trim();
  const cleanStage = String(stage || "progress").toLowerCase();

  if (!projectId || !cleanUrl) {
    console.error("photos.insert validation failed:", { projectId, url, stage });
    return null;
  }

  const fromBackend = await backendCall("photos.add", async () => {
    const res = await API.post("/photos", {
      project_id: projectId,
      url: cleanUrl,
      stage: cleanStage,
    });
    return res.data?.photo || null;
  });
  if (fromBackend) return fromBackend;

  const saved = await tryInsert(TABLES.photos, [
    // Start with minimum required columns first.
    { project_id: projectId, url: cleanUrl },
    { projectId, url: cleanUrl },
    { project_id: projectId, url: cleanUrl, user_id: userId },
    { projectId, url: cleanUrl, user_id: userId },

    // Backend-compatible payload variants.
    { project_id: projectId, url: cleanUrl, stage: cleanStage, user_id: userId },
    { project_id: projectId, url: cleanUrl, stage: cleanStage },

    // Common schema variants.
    { projectId, url: cleanUrl, stage: cleanStage, user_id: userId },
    { projectId, url: cleanUrl, stage: cleanStage },
    { project_id: projectId, photo_url: cleanUrl, user_id: userId },
    { project_id: projectId, image_url: cleanUrl, user_id: userId },
    { project_id: projectId, photo_url: cleanUrl, stage: cleanStage, user_id: userId },
    { project_id: projectId, image_url: cleanUrl, stage: cleanStage, user_id: userId },
    { project_id: projectId, photo: cleanUrl, stage: cleanStage },
  ]);

  if (saved) return saved;

  // Local fallback so UI remains functional when table/RLS is not ready.
  const fallback = {
    id: `local-${Date.now()}`,
    project_id: projectId,
    url: cleanUrl,
    stage: cleanStage,
    created_at: new Date().toISOString(),
    _local: true,
  };
  const rows = readLocalPhotos();
  rows.unshift(fallback);
  writeLocalPhotos(rows);
  console.warn("Saved photo locally because Supabase insert failed.");
  return fallback;
};

export const deletePhoto = async (id) => {
  if (String(id).startsWith("local-")) {
    const rows = readLocalPhotos().filter((x) => x.id !== id);
    writeLocalPhotos(rows);
    return true;
  }
  const fromBackend = await backendCall("photos.delete", async () => {
    await API.delete(`/photos/${id}`);
    return true;
  });
  if (fromBackend) return true;

  const deleted = await deleteById(TABLES.photos, id);
  if (deleted) return true;

  // If remote delete fails, still try removing from local cache.
  const rows = readLocalPhotos().filter((x) => x.id !== id);
  writeLocalPhotos(rows);
  return false;
};

// =========================
// Materials
// =========================
export const getMaterialsByProject = async (projectId) => {
  const fromBackend = await backendCall("materials.getByProject", async () => {
    const res = await API.get(`/materials/project/${projectId}`);
    return res.data || [];
  });
  if (fromBackend) return fromBackend;
  return byProject(TABLES.materials, projectId);
};

export const addMaterial = async ({ projectId, name, quantity, unitCost, purchased }) => {
  const userId = await getCurrentUserId();
  const cleanName = String(name || "").trim();
  const cleanQty = Number(quantity || 1);
  const cleanUnitCost = Number(unitCost || 0);

  if (!projectId || !cleanName || Number.isNaN(cleanQty) || Number.isNaN(cleanUnitCost)) {
    console.error("materials.insert validation failed:", {
      projectId,
      name,
      quantity,
      unitCost,
    });
    return null;
  }

  const fromBackend = await backendCall("materials.add", async () => {
    const res = await API.post("/materials", {
      project_id: projectId,
      name: cleanName,
      quantity: cleanQty,
      unit_cost: cleanUnitCost,
      purchased: !!purchased,
    });
    return res.data?.material || null;
  });
  if (fromBackend) return fromBackend;

  // Backend-compatible payload first.
  return tryInsert(TABLES.materials, [
    { project_id: projectId, name: cleanName, quantity: cleanQty, unit_cost: cleanUnitCost, user_id: userId },
    { project_id: projectId, name: cleanName, quantity: cleanQty, unit_cost: cleanUnitCost },
    { projectId, name: cleanName, quantity: cleanQty, unit_cost: cleanUnitCost, user_id: userId },
    { projectId, name: cleanName, quantity: cleanQty, unit_cost: cleanUnitCost },

    // Optional schema variants
    { project_id: projectId, name: cleanName, quantity: cleanQty, unit_cost: cleanUnitCost, purchased: !!purchased },
    { project_id: projectId, name: cleanName, estimated_price: cleanUnitCost, actual_cost: cleanUnitCost },
  ]);
};

export const updateMaterial = async (id, payload) => {
  const fromBackend = await backendCall("materials.update", async () => {
    const res = await API.put(`/materials/${id}`, payload);
    return res.data?.material || null;
  });
  if (fromBackend) return fromBackend;
  return updateById(TABLES.materials, id, payload);
};
export const deleteMaterial = async (id) => {
  const fromBackend = await backendCall("materials.delete", async () => {
    await API.delete(`/materials/${id}`);
    return true;
  });
  if (fromBackend) return true;
  return deleteById(TABLES.materials, id);
};

// =========================
// Contractors
// =========================
export const getContractorsByProject = async (projectId) => {
  const remote = await byProject(TABLES.contractors, projectId);
  const local = readLocalContractors().filter(
    (x) => x.project_id === projectId || x.projectId === projectId
  );
  return [...local, ...(remote || [])];
};

export const addContractor = async ({ projectId, name, phone, email, notes }) => {
  const userId = await getCurrentUserId();
  const cleanName = String(name || "").trim();
  if (!projectId || !cleanName) return null;

  const saved = await tryInsert(TABLES.contractors, [
    { project_id: projectId, name: cleanName, phone: phone || null, email: email || null, notes: notes || null, user_id: userId },
    { project_id: projectId, name: cleanName, phone: phone || null, email: email || null, user_id: userId },
    { project_id: projectId, name: cleanName, phone: phone || null, email: email || null, notes: notes || null },
    { projectId, name: cleanName, phone: phone || null, email: email || null, notes: notes || null, user_id: userId },
    { projectId, name: cleanName, phone: phone || null, email: email || null, notes: notes || null },
    { project_id: projectId, contractor_name: cleanName, phone: phone || null, email: email || null, user_id: userId },
    { project_id: projectId, full_name: cleanName, phone: phone || null, email: email || null },
    { name: cleanName, phone: phone || null, email: email || null, user_id: userId },
    { name: cleanName, phone: phone || null, email: email || null },
  ]);

  if (saved) return saved;

  const fallback = {
    id: `local-contractor-${Date.now()}`,
    project_id: projectId,
    name: cleanName,
    phone: phone || null,
    email: email || null,
    notes: notes || null,
    _local: true,
    created_at: new Date().toISOString(),
  };
  const rows = readLocalContractors();
  rows.unshift(fallback);
  writeLocalContractors(rows);
  console.warn("Saved contractor locally because Supabase insert failed.");
  return fallback;
};

export const updateContractor = async (id, payload) => {
  if (String(id).startsWith("local-contractor-")) {
    const rows = readLocalContractors().map((x) => (x.id === id ? { ...x, ...payload } : x));
    writeLocalContractors(rows);
    return rows.find((x) => x.id === id) || null;
  }
  const updated = await updateById(TABLES.contractors, id, payload);
  return updated;
};

export const deleteContractor = async (id) => {
  if (String(id).startsWith("local-contractor-")) {
    const rows = readLocalContractors().filter((x) => x.id !== id);
    writeLocalContractors(rows);
    return true;
  }
  const deleted = await deleteById(TABLES.contractors, id);
  if (deleted) return true;
  const rows = readLocalContractors().filter((x) => x.id !== id);
  writeLocalContractors(rows);
  return false;
};

// =========================
// Inventory
// =========================
export const getInventoryByProject = (projectId) => byProject(TABLES.inventory, projectId);

export const getInventory = async () => {
  const { data, error } = await supabase
    .from(TABLES.inventory)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    logErr("inventory.get", error);
    return readLocalInventory();
  }
  return [...readLocalInventory(), ...(data || [])];
};

export const addInventoryItem = async ({ projectId, name, quantity }) => {
  const userId = await getCurrentUserId();
  const cleanName = String(name || "").trim();
  const cleanQty = Number(quantity || 1);
  if (!cleanName || Number.isNaN(cleanQty)) return null;

  const saved = await tryInsert(TABLES.inventory, [
    { project_id: projectId || null, name: cleanName, quantity: cleanQty, used: false, user_id: userId },
    { project_id: projectId || null, name: cleanName, quantity: cleanQty, used: false },
    { projectId: projectId || null, name: cleanName, quantity: cleanQty, used: false, user_id: userId },
    { projectId: projectId || null, name: cleanName, quantity: cleanQty, used: false },
    { name: cleanName, quantity: cleanQty, used: false, user_id: userId },
    { name: cleanName, quantity: cleanQty, used: false },
  ]);

  if (saved) return saved;

  const fallback = {
    id: `local-inventory-${Date.now()}`,
    project_id: projectId || null,
    name: cleanName,
    quantity: cleanQty,
    used: false,
    _local: true,
    created_at: new Date().toISOString(),
  };
  const rows = readLocalInventory();
  rows.unshift(fallback);
  writeLocalInventory(rows);
  console.warn("Saved inventory item locally because Supabase insert failed.");
  return fallback;
};

export const updateInventoryItem = async (id, payload) => {
  if (String(id).startsWith("local-inventory-")) {
    const rows = readLocalInventory().map((x) => (x.id === id ? { ...x, ...payload } : x));
    writeLocalInventory(rows);
    return rows.find((x) => x.id === id) || null;
  }
  return updateById(TABLES.inventory, id, payload);
};

export const deleteInventoryItem = async (id) => {
  if (String(id).startsWith("local-inventory-")) {
    const rows = readLocalInventory().filter((x) => x.id !== id);
    writeLocalInventory(rows);
    return true;
  }
  const deleted = await deleteById(TABLES.inventory, id);
  if (deleted) return true;
  const rows = readLocalInventory().filter((x) => x.id !== id);
  writeLocalInventory(rows);
  return false;
};

// =========================
// Permits
// =========================
export const getPermitsByProject = async (projectId) => {
  const remote = await byProject(TABLES.permits, projectId);
  const local = readLocalPermits().filter(
    (x) => x.project_id === projectId || x.projectId === projectId
  );
  return [...local, ...(remote || [])];
};

export const addPermit = async ({ projectId, name, status, deadline, approvalDate }) => {
  const userId = await getCurrentUserId();
  const cleanName = String(name || "").trim();
  if (!projectId || !cleanName) return null;

  const saved = await tryInsert(TABLES.permits, [
    {
      project_id: projectId,
      name: cleanName,
      status: status || "pending",
      approval_date: approvalDate || null,
      deadline: deadline || null,
      user_id: userId,
    },
    {
      project_id: projectId,
      name: cleanName,
      status: status || "pending",
      approval_date: approvalDate || null,
      deadline: deadline || null,
    },
    {
      project_id: projectId,
      permit_name: cleanName,
      status: status || "pending",
      approval_date: approvalDate || null,
      user_id: userId,
    },
    {
      projectId,
      name: cleanName,
      status: status || "pending",
      approvalDate: approvalDate || null,
      deadline: deadline || null,
      user_id: userId,
    },
    {
      projectId,
      name: cleanName,
      status: status || "pending",
      approvalDate: approvalDate || null,
      deadline: deadline || null,
    },
    {
      project_id: projectId,
      name: cleanName,
      status: status || "pending",
    },
  ]);

  if (saved) return saved;

  const fallback = {
    id: `local-permit-${Date.now()}`,
    project_id: projectId,
    name: cleanName,
    status: status || "pending",
    approval_date: approvalDate || null,
    deadline: deadline || null,
    _local: true,
    created_at: new Date().toISOString(),
  };
  const rows = readLocalPermits();
  rows.unshift(fallback);
  writeLocalPermits(rows);
  console.warn("Saved permit locally because Supabase insert failed.");
  return fallback;
};

export const updatePermit = async (id, payload) => {
  if (String(id).startsWith("local-permit-")) {
    const rows = readLocalPermits().map((x) => (x.id === id ? { ...x, ...payload } : x));
    writeLocalPermits(rows);
    return rows.find((x) => x.id === id) || null;
  }
  const normalized = { ...payload };
  if (normalized.approvalDate !== undefined && normalized.approval_date === undefined) {
    normalized.approval_date = normalized.approvalDate;
  }
  return updateById(TABLES.permits, id, normalized);
};

export const deletePermit = async (id) => {
  if (String(id).startsWith("local-permit-")) {
    const rows = readLocalPermits().filter((x) => x.id !== id);
    writeLocalPermits(rows);
    return true;
  }
  const deleted = await deleteById(TABLES.permits, id);
  if (deleted) return true;
  const rows = readLocalPermits().filter((x) => x.id !== id);
  writeLocalPermits(rows);
  return false;
};

// =========================
// Maintenance
// =========================
export const getMaintenanceTasks = async () => {
  const local = readLocalMaintenance();

  const ordered = await supabase
    .from(TABLES.maintenance)
    .select("*")
    .order("created_at", { ascending: false });
  if (!ordered.error) {
    return [...local, ...(ordered.data || [])];
  }

  const fallback = await supabase.from(TABLES.maintenance).select("*");
  if (fallback.error) {
    logErr("maintenance.get", ordered.error || fallback.error);
    return local;
  }
  return [...local, ...(fallback.data || [])];
};

export const addMaintenanceTask = async (payload) => {
  const userId = await getCurrentUserId();
  const title = String(payload?.title || "").trim();
  if (!title) return null;

  const dueDate = payload?.due_date || payload?.dueDate || null;
  const frequency = String(payload?.frequency || "monthly").toLowerCase();
  const status = String(payload?.status || "pending").toLowerCase();

  const saved = await tryInsert(TABLES.maintenance, [
    { title, due_date: dueDate, frequency, status, user_id: userId },
    { title, due_date: dueDate, frequency, status },
    { title, dueDate, frequency, status, user_id: userId },
    { title, dueDate, frequency, status },
    { task: title, due_date: dueDate, frequency, status, user_id: userId },
    { task_name: title, due_date: dueDate, frequency, status, user_id: userId },
    { title, status, user_id: userId },
    { title, status },
  ]);

  if (saved) return saved;

  const localTask = {
    id: `local-maintenance-${Date.now()}`,
    title,
    due_date: dueDate,
    frequency,
    status,
    _local: true,
    created_at: new Date().toISOString(),
  };
  const rows = readLocalMaintenance();
  rows.unshift(localTask);
  writeLocalMaintenance(rows);
  console.warn("Saved maintenance task locally because Supabase insert failed.");
  return localTask;
};

export const updateMaintenanceTask = async (id, payload) => {
  if (String(id).startsWith("local-maintenance-")) {
    const rows = readLocalMaintenance().map((x) => (x.id === id ? { ...x, ...payload } : x));
    writeLocalMaintenance(rows);
    return rows.find((x) => x.id === id) || null;
  }
  return updateById(TABLES.maintenance, id, payload);
};

// =========================
// Dashboard / Reports
// =========================
export const getDashboardSnapshot = async () => {
  const projects = await getProjects();
  const val = (e) => Number(e.amount ?? e.cost ?? e.price ?? 0);

  let totalBudgetSpent = 0;
  let upcomingTasks = 0;

  for (const p of projects) {
    const [tasks, expenses] = await Promise.all([
      getTasksByProject(p.id),
      getExpensesByProject(p.id),
    ]);

    upcomingTasks += (tasks || []).filter(
      (t) => String(t.status || "").toLowerCase() !== "completed"
    ).length;

    totalBudgetSpent += (expenses || []).reduce((sum, e) => sum + val(e), 0);
  }

  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => String(p.status || "").toLowerCase() === "completed"
  ).length;
  const activeProjects = totalProjects - completedProjects;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalBudgetSpent,
    upcomingTasks,
  };
};

export const getReports = async () => {
  const projects = await getProjects();
  const rows = [];
  const val = (e) => Number(e.amount ?? e.cost ?? e.price ?? 0);

  for (const p of projects) {
    const [tasks, expenses] = await Promise.all([
      getTasksByProject(p.id),
      getExpensesByProject(p.id),
    ]);

    const completed = (tasks || []).filter(
      (t) => String(t.status || "").toLowerCase() === "completed"
    ).length;

    const progress = tasks?.length ? Math.round((completed / tasks.length) * 100) : 0;
    const totalCost = (expenses || []).reduce((sum, e) => sum + val(e), 0);
    const budget = Number(p.budget || 0);

    rows.push({
      id: p.id,
      projectName: p.title || "Untitled",
      status: p.status || "planning",
      progress,
      totalCost,
      budget,
      variance: budget - totalCost,
    });
  }

  return rows;
};

export { updateById };
