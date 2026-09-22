import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", gap: 16, padding: 12, borderBottom: "1px solid #ccc" }}>
      <Link to="/">Books</Link>
      <Link to="/cart">Cart</Link>
      {user ? (
        <>
          <Link to="/orders">My Orders</Link>
          <span style={{ marginLeft: "auto" }}>Hi, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginLeft: "auto" }}>Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
