import { useState } from "react";

const PhotoGallery = ({ photos = [], onDelete }) => {
  const [failedKeys, setFailedKeys] = useState({});

  if (!photos.length) return <p>No photos yet.</p>;

  const normalizeUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  };

  const getUrl = (p) =>
    normalizeUrl(p.url || p.photo_url || p.image_url || p.photo || p.src || "");

  const normalizeStage = (s) => {
    const value = String(s || "").trim().toLowerCase();
    if (value === "before") return "before";
    if (value === "after") return "after";
    return "progress";
  };

  const groups = { before: [], progress: [], after: [] };

  photos.forEach((p, idx) => {
    const stage = normalizeStage(p.stage);
    const url = getUrl(p);
    groups[stage].push({
      ...p,
      url,
      _uiKey: String(p.id || p.created_at || `${stage}-${idx}`),
    });
  });

  const stageMeta = [
    { key: "before", label: "Before" },
    { key: "progress", label: "Progress" },
    { key: "after", label: "After" },
  ];

  return (
    <div className="photo-sections">
      {stageMeta.map(({ key, label }) => (
        <div key={key} className="photo-section">
          <h4>{label}</h4>
          <div className="photo-grid">
            {groups[key].map((p) => {
              const failed = !!failedKeys[p._uiKey];
              return (
                <div key={p._uiKey} className="photo-item">
                  {p.url && !failed ? (
                    <img
                      src={p.url}
                      alt={`${label.toLowerCase()} renovation`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedKeys((prev) => ({
                          ...prev,
                          [p._uiKey]: true,
                        }))
                      }
                    />
                  ) : null}
                  {!p.url && <p className="photo-empty">Invalid image URL saved for this photo.</p>}
                  {failed && (
                    <p className="photo-empty">
                      Could not load preview.{" "}
                      <a href={p.url} target="_blank" rel="noreferrer">
                        Open image
                      </a>
                    </p>
                  )}
                  <button type="button" className="btn-ghost btn-sm" onClick={() => onDelete?.(p.id)}>
                    Remove
                  </button>
                </div>
              );
            })}
            {!groups[key].length && <p className="photo-empty">No {label.toLowerCase()} photos yet.</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;
