import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteProject, getProjects, getReports } from "../api/projectApi.js";
import ProjectCard from "../components/project/ProjectCard.jsx";
import ProjectForm from "../components/project/ProjectForm.jsx";

const Projects = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const load = async () => {
    const [projectRows, reportRows] = await Promise.all([getProjects(), getReports()]);
    const spentByProject = Object.fromEntries((reportRows || []).map((r) => [r.id, Number(r.totalCost || 0)]));

    const merged = (projectRows || []).map((p) => ({
      ...p,
      spent: spentByProject[p.id] || 0,
    }));

    setProjects(merged);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    setEditingProject(null);
    setShowForm(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("new");
      return next;
    });
  }, [searchParams, setSearchParams]);

  const onCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const onEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const onDelete = async (project) => {
    const ok = window.confirm(`Delete project "${project.title}"?`);
    if (!ok) return;
    const deleted = await deleteProject(project.id);
    if (!deleted) {
      alert("Delete failed. Check console.");
      return;
    }
    await load();
  };

  const handleSaved = async (savedProject) => {
    setShowForm(false);
    setEditingProject(null);
    await load();

    if (!editingProject?.id && savedProject?.id) {
      navigate(`/projects/${savedProject.id}`);
    }
  };

  return (
    <div className="projects-container">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button className="btn-primary" onClick={onCreate}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <p className="text-slate-500">No projects yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => navigate(`/projects/${project.id}`)}
              onEdit={() => onEdit(project)}
              onDelete={() => onDelete(project)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          initialData={editingProject}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Projects;
