import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [newName, setNewName] = useState("");

  const [editing, setEditing] = useState({
    id: null,
    value: ""
  });

  function loadDepartments() {
    fetch("http://localhost:4000/departments")
      .then(res => res.json())
      .then(setDepartments);
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function addDepartment() {
    if (!newName.trim()) return;

    fetch("http://localhost:4000/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    }).then(() => {
      setNewName("");
      loadDepartments();
    });
  }

  function saveEdit(id) {
    fetch(`http://localhost:4000/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editing.value })
    }).then(() => {
      setEditing({ id: null, value: "" });
      loadDepartments();
    });
  }

  function deleteDepartment(id) {
    if (!window.confirm("Delete this department?\nProducts will NOT be deleted.")) {
      return;
    }

    fetch(`http://localhost:4000/departments/${id}`, {
      method: "DELETE"
    }).then(loadDepartments);
  }

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
            <th style={{ width: 100 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(d => (
            <tr key={d.id}>
              <td>
                {editing.id === d.id ? (
                  <input
                    autoFocus
                    value={editing.value}
                    onChange={e =>
                      setEditing({ id: d.id, value: e.target.value })
                    }
                    onBlur={() => saveEdit(d.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit(d.id);
                      if (e.key === "Escape")
                        setEditing({ id: null, value: "" });
                    }}
                  />
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setEditing({ id: d.id, value: d.name })
                    }
                  >
                    {d.name}
                  </span>
                )}
              </td>

              <td>
                <button
                  className="danger"
                  onClick={() => deleteDepartment(d.id)}
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
