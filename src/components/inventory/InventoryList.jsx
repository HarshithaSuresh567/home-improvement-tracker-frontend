const InventoryList = ({ items = [] }) => {
  if (!items.length) return <p>No inventory items yet.</p>;

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name} - Qty: {item.quantity}
        </li>
      ))}
    </ul>
  );
};

export default InventoryList;
