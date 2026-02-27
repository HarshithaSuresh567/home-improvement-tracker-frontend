const statusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "bg-emerald-100 text-emerald-700";
  if (s === "active") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
};

const ProjectCard = ({ project, onOpen, onEdit, onDelete }) => {
  const budget = Number(project.budget || 0);
  const spent = Number(project.spent || 0);
  const progress = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <div className="card cursor-pointer" onClick={onOpen}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(project.status)}`}>
          {project.status || "planning"}
        </span>
      </div>

      <p className="mb-2 text-sm text-slate-600 line-clamp-2">
        {project.description || "No description"}
      </p>

      <div className="mb-2 text-sm">
        <span className="font-medium">Deadline:</span>{" "}
        {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Not set"}
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>Budget Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded bg-slate-200">
        <div className="h-full bg-green-600" style={{ width: `${progress}%` }} />
      </div>

      <div className="mb-4 text-sm text-slate-700">
        ${spent.toLocaleString()} / ${budget.toLocaleString()}
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={onEdit}>
          Edit
        </button>
        <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
