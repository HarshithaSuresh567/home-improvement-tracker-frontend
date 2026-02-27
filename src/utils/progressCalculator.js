export const calculateProgress = (tasks) => {
  if (!tasks.length) return 0;
  const done = tasks.filter(t => t.completed).length;
  return (done / tasks.length) * 100;
};