import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import DepartmentPicker from "../components/DepartmentPicker";

const API = import.meta.env.VITE_API_URL;

export default function ProductsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
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
    notes: "",
  });

  /* ================= LOAD PRODUCTS ================= */
  function loadProducts() {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(setProducts)
      .catch(err => console.error("Failed to load products", err));
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadProducts();

    fetch(`${API}/departments`)
      .then(r => r.json())
      .then(data =>
        setDepartments(data.map(d => ({ id: d._id, name: d.name })))
      )
      .catch(() => setDepartments([]));
  }, []);

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (mode === "edit" && editId) {
      fetch(`${API}/products`)
        .then(r => r.json())
        .then(all => {
          const found = all.find(p => p._id === editId);
          if (found) {
            setEditingProduct(found);
            setForm({
              itemName: found.itemName || "",
              price: found.price || "",
              department: found.department || "",
              barcode: found.barcode || "",
              quantity: found.quantity || "",
              notes: found.notes || "",
            });
          }
        });
    } else {
      setEditingProduct(null);
      setForm({
        itemName: "",
        price: "",
        department: "",
        barcode: "",
        quantity: "",
        notes: "",
      });
    }
  }, [mode, editId]);

  /* ================= BARCODE PREFILL ================= */
  useEffect(() => {
    if (mode === "add" && scannedBarcode) {
      setForm(prev => ({ ...prev, barcode: scannedBarcode }));
    }
  }, [mode, scannedBarcode]);

  /* ================= VALIDATION ================= */
  function validateForm() {
    const newErrors = {};

    if (!form.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }

    if (form.price === "" || isNaN(Number(form.price))) {
      newErrors.price = "Valid price is required";
    }

    if (!form.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ================= SAVE PRODUCT ================= */
  function saveProduct(isEdit) {
    if (!isEdit && !validateForm()) return;

    fetch(
      isEdit
        ? `${API}/products/${editingProduct._id}`
        : `${API}/products`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: form.itemName,
          price: Number(form.price),
          department: form.department,
          barcode: form.barcode,
          quantity: Number(form.quantity) || 0,
          notes: form.notes,
        }),
      }
    )
      .then(r => r.json())
      .then(() => {
        loadProducts();
        navigate("/products");
      })
      .catch(err => {
        console.error("SAVE ERROR:", err);
        alert("Failed to save product");
      });
  }

  /* ================= DELETE ================= */
  function deleteProduct() {
    if (!editingProduct) return;
    if (!window.confirm("Delete this product?")) return;

    fetch(`${API}/products/${editingProduct._id}`, {
      method: "DELETE",
    }).then(() => {
      setProducts(p => p.filter(x => x._id !== editingProduct._id));
      navigate("/products");
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

      fetch(`${API}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          rows.map(r => ({
            itemName: r["Item Name"],
            price: Number(r["Price"]),
            department: r["Department"],
            barcode: r["Barcode"],
            quantity: Number(r["Quantity"] || 0),
          }))
        ),
      }).then(loadProducts);
    };

    reader.readAsArrayBuffer(file);
  }

  /* ================= FILTER ================= */
  const filteredProducts = products
    .filter(p => p.itemName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  /* ================= RENDER ================= */
  return (
    <div className="app">
      <button
        type="button"
        className="pill-btn secondary"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      <div className="page-card">
        <div className="page-title">
          <h1>Products</h1>

          {!mode && (
            <div className="page-actions">
              <button
                type="button"
                className="pill-btn"
                onClick={() => fileInputRef.current.click()}
              >
                ⬆ Import
              </button>
            </div>
          )}
        </div>

        {(mode === "add" || mode === "edit") && (
          <>
            <div className="form-grid">
              <div className="form-field full">
                <label>Item Name *</label>
                <input
                  value={form.itemName}
                  onChange={e =>
                    setForm({ ...form, itemName: e.target.value })
                  }
                />
                {errors.itemName && (
                  <span className="error-text">{errors.itemName}</span>
                )}
              </div>

              <div className="form-field">
                <label>Price *</label>
                <input
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
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
                  onChange={name =>
                    setForm({ ...form, department: name })
                  }
                />
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
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

            <div className="form-actions">
              <button
                type="button"
                className="pill-btn"
                onClick={() => saveProduct(mode === "edit")}
              >
                ✅ Save
              </button>

              <button
                type="button"
                className="pill-btn secondary"
                onClick={() => navigate("/products")}
              >
                Cancel
              </button>

              {mode === "edit" && (
                <button
                  type="button"
                  className="pill-btn"
                  style={{ background: "#dc2626" }}
                  onClick={deleteProduct}
                >
                  🗑 Delete
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
                    key={p._id}
                    onClick={() =>
                      navigate(`/products?mode=edit&id=${p._id}`)
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