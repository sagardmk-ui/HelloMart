import { useEffect, useRef, useState } from "react";

export default function DepartmentPicker({
  value = "",
  departments = [],
  onChange,
  placeholder = "Select department"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dept-combobox" ref={wrapperRef}>
      {/* INPUT */}
      <div
        className="dept-combobox-input"
        onClick={() => setOpen(true)}
      >
        {value || (
          <span className="dept-combobox-placeholder">
            {placeholder}
          </span>
        )}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="dept-combobox-dropdown">
          <div className="dept-combobox-header">
            <span>Select Department</span>
            <button
              type="button"
              className="dept-combobox-close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="dept-combobox-search">
            <input
              autoFocus
              placeholder="Search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="dept-combobox-list">
            {filtered.map(d => (
              <div
                key={d.id}
                className={`dept-combobox-item ${
                  d.name === value ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(d.name);
                  setOpen(false);
                }}
              >
                {d.name}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="dept-combobox-empty">
                No departments found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
``