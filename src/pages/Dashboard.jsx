import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../api/dashboardApi.js";
import { addTask, getProjects, getTasksByProject } from "../api/projectApi.js";

const Dashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudgetSpent: 0,
    upcomingTasks: 0,
  });
  const [projects, setProjects] = useState([]);
  const [upcomingTaskRows, setUpcomingTaskRows] = useState([]);

  const [showTaskQuickAdd, setShowTaskQuickAdd] = useState(false);
  const [taskForm, setTaskForm] = useState({
    projectId: "",
    title: "",
    priority: "medium",
    dueDate: "",
  });
  const [taskError, setTaskError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const load = async () => {
    const [dashboard, projectList] = await Promise.all([getDashboardData(), getProjects()]);
    setData(dashboard);
    setProjects(projectList || []);

    const tasksByProject = await Promise.all(
      (projectList || []).map(async (project) => {
        const rows = await getTasksByProject(project.id);
        return (rows || [])
          .filter((t) => String(t.status || "").toLowerCase() !== "completed")
          .map((t) => ({
            id: t.id,
            title: t.title,
            dueDate: t.deadline || t.due_date || t.dueDate || null,
            priority: t.priority || "medium",
            projectTitle: project.title,
          }));
      })
    );

    setUpcomingTaskRows(tasksByProject.flat().slice(0, 6));
  };

  useEffect(() => {
    load();
  }, []);

  const projectCompletionPercent = useMemo(() => {
    if (!data.totalProjects) return 0;
    return Math.round((data.completedProjects / data.totalProjects) * 100);
  }, [data]);

  const taskStatusPercent = useMemo(() => {
    const totalKnown = data.upcomingTasks + data.completedProjects;
    if (!totalKnown) return 0;
    return Math.max(0, Math.min(100, Math.round((data.upcomingTasks / totalKnown) * 100)));
  }, [data]);

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    setTaskError("");

    if (!taskForm.projectId || !taskForm.title.trim()) {
      setTaskError("Project and task title are required.");
      return;
    }

    setTaskLoading(true);
    const created = await addTask({
      projectId: taskForm.projectId,
      title: taskForm.title.trim(),
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || null,
      status: "pending",
    });
    setTaskLoading(false);

    if (!created) {
      setTaskError("Task not added. Check console for API error.");
      return;
    }

    setTaskForm({ projectId: "", title: "", priority: "medium", dueDate: "" });
    setShowTaskQuickAdd(false);
    await load();
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="cards-container">
        <div className="card">
          <h3>Total Projects</h3>
          <p className="text-3xl font-bold">{data.totalProjects}</p>
        </div>
        <div className="card">
          <h3>Active Projects</h3>
          <p className="text-3xl font-bold">{data.activeProjects}</p>
        </div>
        <div className="card">
          <h3>Completed Projects</h3>
          <p className="text-3xl font-bold">{data.completedProjects}</p>
        </div>
        <div className="card">
          <h3>Total Budget Spent</h3>
          <p className="text-3xl font-bold">${Number(data.totalBudgetSpent).toLocaleString()}</p>
        </div>
      </div>

      <div className="quick-links">
        <button className="btn-primary" onClick={() => navigate("/projects?new=1")}>
          + New Project
        </button>
        <button className="btn-primary" onClick={() => setShowTaskQuickAdd((prev) => !prev)}>
          + Add Task
        </button>
        <button className="btn-primary" onClick={() => navigate("/reports")}>
          View Reports
        </button>
      </div>

      {showTaskQuickAdd && (
        <form className="card inline-form" onSubmit={handleQuickAddTask}>
          <select
            className="input"
            value={taskForm.projectId}
            onChange={(e) => setTaskForm((p) => ({ ...p, projectId: e.target.value }))}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
          />

          <select
            className="input"
            value={taskForm.priority}
            onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            className="input"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
          />

          <button className="btn-primary" type="submit" disabled={taskLoading}>
            {taskLoading ? "Adding..." : "Save Task"}
          </button>
          {taskError && <p className="error">{taskError}</p>}
        </form>
      )}

      <div className="cards-container">
        <div className="card">
          <h3>Project Completion</h3>
          <div className="mb-2 h-2 rounded bg-slate-200">
            <div
              className="h-2 rounded bg-green-600"
              style={{ width: `${projectCompletionPercent}%` }}
            />
          </div>
          <p>{projectCompletionPercent}% completed</p>
        </div>

        <div className="card">
          <h3>Task Load</h3>
          <div className="mb-2 h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-blue-600" style={{ width: `${taskStatusPercent}%` }} />
          </div>
          <p>{data.upcomingTasks} upcoming tasks</p>
        </div>
      </div>

      <section className="card">
        <h3 className="mb-3 text-lg font-semibold">Upcoming Tasks</h3>
        {!upcomingTaskRows.length ? (
          <p className="text-slate-500">No upcoming tasks.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingTaskRows.map((task) => (
              <li key={task.id} className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-slate-500">
                  {task.projectTitle} | {task.priority} | Due:{" "}
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
