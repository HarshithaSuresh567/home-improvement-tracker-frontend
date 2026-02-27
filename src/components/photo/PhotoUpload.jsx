import { useState } from "react";

const PhotoUpload = ({ onSubmit }) => {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState("before");
  const [error, setError] = useState("");

  const normalizeUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) return setError("Image URL is required");
    try {
      // Basic URL validation for cleaner user feedback.
      new URL(normalizedUrl);
    } catch {
      return setError("Enter a valid image URL.");
    }

    const created = await onSubmit?.({ url: normalizedUrl, stage });
    if (!created) return setError("Photo not added");

    setUrl("");
    setStage("before");
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <select className="input" value={stage} onChange={(e) => setStage(e.target.value)}>
        <option value="before">Before</option>
        <option value="progress">Progress</option>
        <option value="after">After</option>
      </select>
      <input
        className="input"
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit" className="btn-primary">Add Photo</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default PhotoUpload;
