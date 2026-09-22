import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

const CATEGORIES = ["Fiction", "Non-Fiction", "Academic", "Comics"];
const FORMATS = ["Hardcover", "Paperback", "E-Book"];

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", category: "all", format: "all", availability: "all" });
  const [error, setError] = useState("");

  const load = (page = 1) => {
    const params = new URLSearchParams({ page, limit: 10 });
    if (filters.search) params.set("search", filters.search);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.format !== "all") params.set("format", filters.format);
    if (filters.availability !== "all") params.set("availability", filters.availability);

    api
      .get(`/books?${params.toString()}`)
      .then((res) => {
        setBooks(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <h2>Book Catalog</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          placeholder="Search title/author/description"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select value={filters.category} onChange={(e) => onFilterChange("category", e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.format} onChange={(e) => onFilterChange("format", e.target.value)}>
          <option value="all">All Formats</option>
          {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filters.availability} onChange={(e) => onFilterChange("availability", e.target.value)}>
          <option value="all">All</option>
          <option value="available">Available Only</option>
        </select>
        <button onClick={() => load(1)}>Apply Filters</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {books.map((b) => (
          <Link key={b._id} to={`/books/${b._id}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid #ddd", padding: 8 }}>
            <img
              src={`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/books/${b._id}/cover?w=160`}
              alt={b.title}
              style={{ width: "100%", height: 140, objectFit: "cover", background: "#eee" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <p style={{ fontWeight: "bold", margin: "6px 0 2px" }}>{b.title}</p>
            <p style={{ fontSize: 12, margin: 0 }}>{b.author}</p>
            <p style={{ fontSize: 12, margin: 0 }}>{b.category} · {b.totalCopies} copies</p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Prev</button>
        <span style={{ margin: "0 10px" }}>Page {pagination.page} of {pagination.totalPages}</span>
        <button disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>Next</button>
      </div>
    </div>
  );
}
