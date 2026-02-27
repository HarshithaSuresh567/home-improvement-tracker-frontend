const ContractorList = ({ contractors }) => {
  return (
    <ul>
      {contractors.map((c, i) => (
        <li key={i}>{c.name}</li>
      ))}
    </ul>
  );
};

export default ContractorList;