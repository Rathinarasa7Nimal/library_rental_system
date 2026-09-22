import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function Cart({ user }) {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const load = () => {
  api.get("/cart").then((res) => setItems(res.data));
};
useEffect(() => {
  load();
}, []);

  const updateCount = async (id, count) => {
    if (count < 1) return;
    await api.put(`/cart/${id}`, { count });
    load();
  };

  const remove = async (id) => {
    await api.del(`/cart/${id}`);
    load();
  };

  const checkout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.post("/orders/checkout");
      setMsg(`Order placed! Order ID: ${res.data._id}. Total fee: Rs.${res.data.totalFee}. A confirmation email has been sent.`);
      load();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const total = items.reduce((sum, i) => {
    const fmt = i.bookId?.formats?.find((f) => f.format === i.format);
    return sum + (fmt ? fmt.pricePerDay * 14 * i.count : 0);
  }, 0);

  return (
    <div>
      <h2>Your Rental Cart</h2>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map((i) => (
        <div key={i._id} style={{ display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #eee", padding: "8px 0" }}>
          <span style={{ flex: 1 }}>{i.bookId?.title} ({i.format})</span>
          <input type="number" min="1" value={i.count} onChange={(e) => updateCount(i._id, Number(e.target.value))} style={{ width: 60 }} />
          <button onClick={() => remove(i._id)}>Remove</button>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <p><b>Estimated total (14-day rental): Rs.{total.toFixed(2)}</b></p>
          <button onClick={checkout}>Checkout</button>
        </>
      )}
      {msg && <p>{msg}</p>}
    </div>
  );
}
