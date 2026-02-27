import { useEffect, useMemo, useState } from "react";
import { getReportsData } from "../api/dashboardApi";

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getReportsData().then((data) => setReports(data || []));
  }, []);

  const totals = useMemo(() => {
    const totalBudget = reports.reduce((sum, x) => sum + Number(x.budget || 0), 0);
    const totalSpent = reports.reduce((sum, x) => sum + Number(x.totalCost || 0), 0);
    const avgProgress = reports.length
      ? Math.round(reports.reduce((sum, x) => sum + Number(x.progress || 0), 0) / reports.length)
      : 0;
    return {
      totalBudget,
      totalSpent,
      variance: totalBudget - totalSpent,
      avgProgress,
    };
  }, [reports]);

  const budgetBar = totals.totalBudget > 0 ? Math.min(100, Math.round((totals.totalSpent / totals.totalBudget) * 100)) : 0;

  return (
    <div className="projects-container">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 Reports</h1>
        <button className="btn-primary" onClick={() => window.print()}>
          📄 Download PDF
        </button>
      </div>

      <div className="cards-container">
        <div className="card">
          <h3>Total Budget</h3>
          <p className="text-2xl font-bold">${totals.totalBudget.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Total Spent</h3>
          <p className="text-2xl font-bold">${totals.totalSpent.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Variance</h3>
          <p className="text-2xl font-bold">${totals.variance.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Task Completion</h3>
          <p className="text-2xl font-bold">{totals.avgProgress}%</p>
        </div>
      </div>

      <section className="card">
        <h2 className="mb-2 text-xl font-semibold">Budget vs Spent</h2>
        <div className="mb-1 flex justify-between text-sm">
          <span>Spent / Budget</span>
          <span>{budgetBar}%</span>
        </div>
        <div className="h-3 rounded bg-slate-200">
          <div className="h-3 rounded bg-blue-600" style={{ width: `${budgetBar}%` }} />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Past Project Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2">Project</th>
                <th className="py-2">Status</th>
                <th className="py-2">Progress</th>
                <th className="py-2">Budget</th>
                <th className="py-2">Spent</th>
                <th className="py-2">Variance</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-2">{r.projectName}</td>
                  <td className="py-2 capitalize">{r.status}</td>
                  <td className="py-2">{r.progress}%</td>
                  <td className="py-2">${Number(r.budget || 0).toLocaleString()}</td>
                  <td className="py-2">${Number(r.totalCost || 0).toLocaleString()}</td>
                  <td className="py-2">${Number(r.variance || 0).toLocaleString()}</td>
                </tr>
              ))}
              {!reports.length && (
                <tr>
                  <td colSpan="6" className="py-3 text-slate-500">
                    No reports available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Reports;
