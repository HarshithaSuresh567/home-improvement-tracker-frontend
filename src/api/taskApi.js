import { addTask, deleteTask, getTasksByProject, updateTask } from "./projectApi.js";

export const getTasks = async (projectId) => {
  if (!projectId) return [];
  return await getTasksByProject(projectId);
};

export const createTask = async ({ projectId, title, priority, assignedTo, dueDate, status }) =>
  addTask({
    projectId,
    title,
    priority: priority || "medium",
    assignedTo: assignedTo || "",
    dueDate: dueDate || null,
    status: status || "pending",
  });

export const editTask = async (id, patch) => updateTask(id, patch);
export const removeTask = async (id) => deleteTask(id);
export const markComplete = async (id) => updateTask(id, { status: "completed" });
