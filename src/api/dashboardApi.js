import { getProjects, getReports, getTasksByProject, getExpensesByProject } from "./projectApi.js";

export const getDashboardData = async () => {
  const projects = (await getProjects()) || [];
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

export const getDashboardCharts = async () => {
  const projects = (await getProjects()) || [];

  const statusMap = {
    planning: 0,
    active: 0,
    completed: 0,
    on_hold: 0,
  };

  projects.forEach((p) => {
    const key = String(p.status || "planning").toLowerCase().replace(/\s+/g, "_");
    if (statusMap[key] !== undefined) statusMap[key] += 1;
    else statusMap.active += 1;
  });

  return {
    projectStatus: [
      { label: "Planning", value: statusMap.planning },
      { label: "Active", value: statusMap.active },
      { label: "Completed", value: statusMap.completed },
      { label: "On Hold", value: statusMap.on_hold },
    ],
  };
};

export const getReportsData = async () => {
  const rows = (await getReports()) || [];
  return rows.map((r) => ({
    id: r.id,
    projectName: r.projectName,
    status: r.status,
    progress: r.progress,
    totalCost: r.totalCost,
    budget: r.budget,
    variance: r.variance,
  }));
};
