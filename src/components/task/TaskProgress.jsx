const TaskProgress = ({ tasks = [] }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => String(t.status || "").toLowerCase() === "completed").length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card">
      <div className="mb-1 flex justify-between text-sm">
        <span>Task Completion</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 rounded bg-slate-200">
        <div className="h-2 rounded bg-green-600" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{completed} of {total} completed</p>
    </div>
  );
};

export default TaskProgress;
