import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [format, setFormat] = useState("");
  const [count, setCount] = useState(1);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/books/${id}`).then((res) => {
      setBook(res.data);
      if (res.data.formats?.length) setFormat(res.data.formats[0].format);
    });
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post("/cart", { bookId: id, format, count: Number(count) });
      setMsg("Added to cart!");
    } catch (e) {
      setMsg(e.message);
    }
  };

  if (!book) return <p>Loading...</p>;
  const chosen = book.formats.find((f) => f.format === format);

  return (
    <div>
      <button onClick={() => navigate(-1)}>&larr; Back</button>
      <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
        <img
          src={`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/books/${id}/cover?w=300`}
          alt={book.title}
          style={{ width: 220, height: 300, objectFit: "cover", background: "#eee" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div>
          <h2>{book.title}</h2>
          <p>by {book.author}</p>
          <p>{book.description}</p>
          <p>Category: {book.category}</p>

          <label>Format: </label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {book.formats.map((f) => (
              <option key={f.format} value={f.format}>
                {f.format} - Rs.{f.pricePerDay}/day ({f.copies} copies)
              </option>
            ))}
          </select>
          <br /><br />
          <label>Quantity: </label>
          <input type="number" min="1" max={chosen?.copies || 1} value={count} onChange={(e) => setCount(e.target.value)} style={{ width: 60 }} />
          <br /><br />
          <button onClick={addToCart} disabled={!chosen || chosen.copies < 1}>Add to Cart</button>
          {chosen && chosen.copies < 1 && <p style={{ color: "red" }}>Out of stock in this format.</p>}
          {msg && <p>{msg}</p>}
        </div>
      </div>
    </div>
  );
}
