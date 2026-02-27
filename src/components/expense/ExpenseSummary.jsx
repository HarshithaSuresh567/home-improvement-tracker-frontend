const ExpenseSummary = ({ expenses = [], budget = 0 }) => {
  const val = (e) => Number(e.amount ?? e.cost ?? e.price ?? 0);

  const materialCost = expenses
    .filter((e) => (e.category || "").toLowerCase() === "material")
    .reduce((s, e) => s + val(e), 0);

  const contractorCost = expenses
    .filter((e) => (e.category || "").toLowerCase() === "contractor")
    .reduce((s, e) => s + val(e), 0);

  const otherCost = expenses
    .filter((e) => !["material", "contractor"].includes((e.category || "").toLowerCase()))
    .reduce((s, e) => s + val(e), 0);

  const totalSpent = materialCost + contractorCost + otherCost;
  const remaining = Number(budget || 0) - totalSpent;

  const totalForChart = totalSpent || 1;
  const mPct = Math.round((materialCost / totalForChart) * 100);
  const cPct = Math.round((contractorCost / totalForChart) * 100);
  const oPct = 100 - mPct - cPct;

  const pieStyle = {
    background: `conic-gradient(#16a34a 0 ${mPct}%, #2563eb ${mPct}% ${mPct + cPct}%, #f59e0b ${mPct + cPct}% 100%)`,
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="card space-y-2">
        <h3 className="font-semibold">Budget Summary</h3>
        <p>Material Cost: <b>${materialCost.toLocaleString()}</b></p>
        <p>Contractor Cost: <b>${contractorCost.toLocaleString()}</b></p>
        <p>Total Spent: <b>${totalSpent.toLocaleString()}</b></p>
        <p className={remaining < 0 ? "text-red-600" : ""}>
          Remaining Budget: <b>${remaining.toLocaleString()}</b>
        </p>
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold">Expense Breakdown (Pie)</h3>
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 rounded-full" style={pieStyle} />
          <div className="text-sm space-y-1">
            <p><span className="inline-block h-3 w-3 rounded bg-green-600 mr-2" />Material ({mPct}%)</p>
            <p><span className="inline-block h-3 w-3 rounded bg-blue-600 mr-2" />Contractor ({cPct}%)</p>
            <p><span className="inline-block h-3 w-3 rounded bg-amber-500 mr-2" />Other ({oPct}%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
