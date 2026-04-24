import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ProductsPage from "./pages/ProductsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import BarcodeScanner from "./components/BarcodeScanner";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

/* ✅ BACKEND URL FROM ENV */
const API_URL = import.meta.env.VITE_API_URL;

/* ================= AUTH GUARD ================= */
function ProtectedRoute({ children }) {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  return loggedIn ? children : <Navigate to="/login" replace />;
}

/* ================= HOME ================= */
function Home() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showScanner, setShowScanner] = useState(false);

  /* ✅ LOAD PRODUCTS */
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then(setAllProducts)
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  /* ✅ LIVE SEARCH */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matches = allProducts
      .filter(
        p =>
          p.itemName.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      )
      .slice(0, 8);

    setResults(matches);
  }, [query, allProducts]);

  /* ✅ CLOSE SEARCH DROPDOWN */
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setQuery("");
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ✅ KEYBOARD NAV */
  function handleKeyDown(e) {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex(i => Math.max(i - 1, 0));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      navigate(`/products?mode=edit&id=${results[activeIndex]._id}`);
      setQuery("");
    }
  }

  /* ✅ BARCODE SCAN */
  function handleScan(barcode) {
    setShowScanner(false);

    const existing = allProducts.find(p => p.barcode === barcode);

    if (existing) {
      navigate(`/products?mode=edit&id=${existing._id}`);
      return;
    }

    navigate(`/products?mode=add&barcode=${barcode}`);
  }

  return (
    <div className="app">
      {/* HEADER */}
      <div className="home-header">
        <div>
          <h1>Inventory</h1>
          <p className="subtle">
            {loading && "Loading products…"}
            {error && <span className="error">{error}</span>}
          </p>
        </div>

        <div className="home-actions">
          <button
            className="pill-btn secondary"
            onClick={() => navigate("/products?mode=add")}
          >
            ＋ Add
          </button>

          <button
            className="pill-btn"
            onClick={() => setShowScanner(true)}
          >
            📷 Scan
          </button>

          <button
            className="pill-btn secondary"
            onClick={() => {
              localStorage.removeItem("loggedIn");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div ref={wrapperRef} className="home-search">
        <input
          className="search-input"
          placeholder="Search product name or barcode…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
        />

        {results.length > 0 && (
          <div className="search-dropdown">
            {results.map((p, i) => (
              <div
                key={p._id}
                className={`search-item ${i === activeIndex ? "active" : ""}`}
                onMouseDown={() =>
                  navigate(`/products?mode=edit&id=${p._id}`)
                }
              >
                <strong>{p.itemName}</strong>
                <div className="search-meta">
                  {p.department} • Qty {p.quantity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LINKS */}
      <div className="home-links">
        <button
          className="pill-btn secondary"
          onClick={() => navigate("/products")}
        >
          📦 Products
        </button>

        <button
          className="pill-btn secondary"
          onClick={() => navigate("/departments")}
        >
          🗂 Departments
        </button>
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleScan}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

/* ================= ROUTES ================= */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <DepartmentsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}