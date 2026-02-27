const BudgetOverview = ({ total, spent }) => {
  return (
    <div className="card">
      <h4>Total Budget: ₹{total}</h4>
      <h4>Spent: ₹{spent}</h4>
      <h4>Remaining: ₹{total - spent}</h4>
    </div>
  );
};

export default BudgetOverview;