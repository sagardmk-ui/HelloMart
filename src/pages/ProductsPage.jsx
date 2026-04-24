import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import DepartmentPicker from "../components/DepartmentPicker";

export default function ProductsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // add | edit | null
  const editId = searchParams.get("id");
  const scannedBarcode = searchParams.get("barcode");

  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    itemName: "",
    price: "",
    department: "",
    barcode: "",
    quantity: "",
    notes: ""
  });

  /* ================= LOAD PRODUCTS ================= */
  function loadProducts() {
    fetch("http://localhost:4000/products")
      .then(r => r.json())
      .then(setProducts)
      .catch(err => console.error("Failed to load products", err));
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadProducts();

    fetch("http://localhost:4000/departments")
      .then(r => r.json())
      .then(data => {
        const normalized = data.map((d, index) => ({
          id: d.id ?? index,
          name:
            typeof d === "string"
              ? d
              : d.name || d.department || ""
        }));
        setDepartments(normalized);
      })
      .catch(err => {
        console.error("Failed to load departments:", err);
        setDepartments([]);
      });
  }, []);

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (mode === "edit" && editId) {
      fetch("http://localhost:4000/products")
        .then(r => r.json())
        .then(all => {
          const found = all.find(p => String(p.id) === String(editId));
          if (found) {
            setEditingProduct(found);
            setForm(found);
          }
        });
    } else {
      setEditingProduct(null);
    }
  }, [mode, editId]);

  /* ================= BARCODE PREFILL ================= */
  useEffect(() => {
    if (mode === "add" && scannedBarcode) {
      setForm(prev => ({ ...prev, barcode: scannedBarcode }));
    }
  }, [mode, scannedBarcode]);

  /* ================= VALIDATION (ADD ONLY) ================= */
  function validateForm() {
    const newErrors = {};

    if (!form.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }

    if (!form.price || isNaN(form.price)) {
      newErrors.price = "Valid price is required";
    }

    if (!form.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ================= SAVE ================= */
  function saveProduct(isEdit) {
    // ✅ enforce mandatory fields only when ADDING
    if (!isEdit) {
      if (!validateForm()) return;
    }

    fetch(
      isEdit
        ? `http://localhost:4000/products/${editingProduct.id}`
        : "http://localhost:4000/products",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity) || 0
        })
      }
    ).then(() => {
      loadProducts();
      navigate("/products");
    });
  }

  /* ================= DELETE ================= */
  function deleteProduct() {
    if (!editingProduct) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${editingProduct.itemName}"?\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    fetch(`http://localhost:4000/products/${editingProduct.id}`, {
      method: "DELETE"
    })
      .then(() => {
        setProducts(prev =>
          prev.filter(p => p.id !== editingProduct.id)
        );
        navigate("/products");
      })
      .catch(err => {
        console.error("Failed to delete product", err);
        alert("Failed to delete product");
      });
  }

  /* ================= IMPORT ================= */
  function importFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      fetch("http://localhost:4000/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          rows.map(r => ({
            itemName: r["Item Name"],
            price: r["Price"],
            department: r["Department"],
            barcode: r["Barcode"],
            quantity: Number(r["Quantity"] || 0)
          }))
        )
      }).then(() => loadProducts());
    };

    reader.readAsArrayBuffer(file);
  }

  /* ================= FILTER ================= */
  const filteredProducts = products
  .filter(p =>
    p.itemName.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) =>
    a.itemName.localeCompare(b.itemName, undefined, { sensitivity: "base" })
  );
  /* ================= RENDER ================= */
  return (
    <div className="app">
      <button className="pill-btn secondary" onClick={() => navigate("/")}>
        ← Back
      </button>

      <div className="page-card">
        <div className="page-title">
          <div>
            <h1>Products</h1>
            <p className="subtle">Manage your inventory items</p>
          </div>

          {!mode && (
            <div className="page-actions">
              <button
                className="pill-btn"
                onClick={() => fileInputRef.current.click()}
              >
                ⬆ Import
              </button>
              <button
                className="pill-btn"
                onClick={() =>
                  window.open("http://localhost:4000/export")
                }
              >
                ⬇ Export
              </button>
            </div>
          )}
        </div>

        {(mode === "add" || mode === "edit") && (
          <>
            <div className="card-header">
              <h2>{mode === "add" ? "Add Product" : "Edit Product"}</h2>
              <p className="subtle">Manage product information</p>
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Item Name *</label>
                <input
                  value={form.itemName}
                  onChange={e => {
                    setForm({ ...form, itemName: e.target.value });
                    setErrors({ ...errors, itemName: null });
                  }}
                />
                {errors.itemName && (
                  <span className="error-text">{errors.itemName}</span>
                )}
              </div>

              <div className="form-field">
                <label>Price *</label>
                <input
                  value={form.price}
                  onChange={e => {
                    setForm({ ...form, price: e.target.value });
                    setErrors({ ...errors, price: null });
                  }}
                />
                {errors.price && (
                  <span className="error-text">{errors.price}</span>
                )}
              </div>

              <div className="form-field">
                <label>Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Department *</label>
                <DepartmentPicker
                  value={form.department}
                  departments={departments}
                  onChange={name => {
                    setForm({ ...form, department: name });
                    setErrors({ ...errors, department: null });
                  }}
                />
                {errors.department && (
                  <span className="error-text">
                    {errors.department}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Barcode</label>
                <input
                  value={form.barcode}
                  onChange={e =>
                    setForm({ ...form, barcode: e.target.value })
                  }
                />
              </div>

              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-actions" style={{ justifyContent: "space-between" }}>
              <div>
                <button
                  className="pill-btn"
                  onClick={() => saveProduct(mode === "edit")}
                >
                  ✅ Save
                </button>
                <button
                  className="pill-btn secondary"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </button>
              </div>

              {mode === "edit" && (
                <button
                  className="pill-btn"
                  style={{ background: "#dc2626" }}
                  onClick={deleteProduct}
                >
                  🗑 Delete Product
                </button>
              )}
            </div>
          </>
        )}

        {!mode && (
          <>
            <input
              className="table-search"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr
                    key={p.id}
                    onClick={() =>
                      navigate(`/products?mode=edit&id=${p.id}`)
                    }
                  >
                    <td>{p.itemName}</td>
                    <td>{p.department}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".xlsx,.xls"
        onChange={e => importFile(e.target.files[0])}
      />
    </div>
  );
}
``