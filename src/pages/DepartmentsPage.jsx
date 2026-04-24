import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function DepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [newName, setNewName] = useState("");

  const [editing, setEditing] = useState({
    id: null,
    value: ""
  });

  /* ================= LOAD ================= */
  function loadDepartments() {
    fetch(`${API}/departments`)
      .then(res => res.json())
      .then(data => {
        // Normalize MongoDB response
        const normalized = data.map(d => ({
          _id: d._id,
          name: d.name
        }));
        setDepartments(normalized);
      })
      .catch(err => {
        console.error("Failed to load departments", err);
        setDepartments([]);
      });
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  /* ================= ADD ================= */
  function addDepartment() {
    if (!newName.trim()) return;

    fetch(`${API}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() })
    }).then(() => {
      setNewName("");
      loadDepartments();
    });
  }

  /* ================= SAVE EDIT ================= */
  function saveEdit(id) {
    if (!editing.value.trim()) {
      setEditing({ id: null, value: "" });
      return;
    }

    fetch(`${API}/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editing.value.trim() })
    }).then(() => {
      setEditing({ id: null, value: "" });
      loadDepartments();
    });
  }

  /* ================= DELETE ================= */
  function deleteDepartment(id) {
    if (!window.confirm("Delete this department?\nProducts will NOT be deleted.")) {
      return;
    }

    fetch(`${API}/departments/${id}`, {
      method: "DELETE"
    }).then(() => {
      setDepartments(prev => prev.filter(d => d._id !== id));
    });
  }

  /* ================= RENDER ================= */
  return (
    <div className="app">
      <button className="secondary" onClick={() => navigate("/")}>
        ← Back
      </button>

      <h1>Departments</h1>

      {/* ADD DEPARTMENT */}
      <div className="product" style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="New department name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button className="primary" onClick={addDepartment}>
          Add
        </button>
      </div>

      {/* DEPARTMENTS TABLE */}
      <table className="product-table" style={{ marginTop: 15 }}>
        <thead>
          <tr>
            <th>Department Name</th>
            <th style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(d => (
            <tr key={d._id}>
              <td>
                {editing.id === d._id ? (
                  <input
                    autoFocus
                    value={editing.value}
                    onChange={e =>
                      setEditing({ id: d._id, value: e.target.value })
                    }
                    onBlur={() => saveEdit(d._id)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit(d._id);
                      if (e.key === "Escape")
                        setEditing({ id: null, value: "" });
                    }}
                  />
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setEditing({ id: d._id, value: d.name })
                    }
                  >
                    {d.name}
                  </span>
                )}
              </td>

              <td>
                <button
                  className="danger"
                  onClick={() => deleteDepartment(d._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {departments.length === 0 && (
            <tr>
              <td colSpan="2" style={{ textAlign: "center", padding: 20 }}>
                No departments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentsPage;