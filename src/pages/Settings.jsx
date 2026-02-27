import { useState } from "react";

const Settings = () => {
  const [ok, setOk] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setOk("Settings saved.");
    setTimeout(() => setOk(""), 2000);
  };

  return (
    <div className="projects-container">
      <h1 className="text-3xl font-bold">⚙️ Settings</h1>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">🛠️ Preferences</h2>
        <form onSubmit={onSubmit} className="stack">
          <label>
            <input type="checkbox" defaultChecked /> Email reminders
          </label>
          <label>
            <input type="checkbox" defaultChecked /> Weekly summary
          </label>
          <button type="submit" className="btn-primary">Save Settings</button>
          {ok && <p>{ok}</p>}
        </form>
      </section>
    </div>
  );
};

export default Settings;
