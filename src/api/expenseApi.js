import { addExpense, deleteExpense, getExpensesByProject, updateExpense } from "./projectApi.js";

export const getExpenses = async (projectId) => {
  if (!projectId) return [];
  return (await getExpensesByProject(projectId)) || [];
};

export const createExpense = async ({ projectId, title, amount, category = "other", purchasedAt = null }) => {
  if (!projectId || !title?.trim()) {
    console.error("createExpense validation failed:", { projectId, title });
    return null;
  }
  const saved = await addExpense({
    projectId,
    title: title.trim(),
    amount: Number(amount || 0),
    category,
    purchasedAt,
  });
  if (!saved) {
    console.error("createExpense failed: check previous expenses.insert logs for schema/RLS issue");
  }
  return saved;
};

export const editExpense = async (id, patch) => updateExpense(id, patch);

export const removeExpense = async (expenseId) => {
  if (!expenseId) return false;
  return deleteExpense(expenseId);
};
