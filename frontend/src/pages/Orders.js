import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div>
      <h2>My Rental Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((o) => (
        <div key={o._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <p><b>Order ID:</b> {o._id}</p>
          <p><b>Status:</b> {o.status}</p>
          <p><b>Rented:</b> {new Date(o.rentDate).toDateString()} &nbsp; <b>Due:</b> {new Date(o.rentCloseDate).toDateString()}</p>
          <ul>
            {o.books.map((b, idx) => (
              <li key={idx}>{b.title} ({b.format}) x{b.count} - Rs.{b.lineFee}</li>
            ))}
          </ul>
          <p><b>Total: Rs.{o.totalFee}</b></p>
        </div>
      ))}
    </div>
  );
}
