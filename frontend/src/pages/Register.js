import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";


export default function Register({ setUser }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const passwordValid = PASSWORD_REGEX.test(form.password);

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordValid) {
      setError(PASSWORD_RULES_MESSAGE);
      return;
    }
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("token", res.token);
      setUser(res.user);
      await api.post("/cart/merge", { guestId: api.getGuestId() }).catch(() => {});
      navigate("/");
    } catch (e2) {
      setError(e2.message);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 320 }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><br /><br />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><br /><br />
      <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><br /><br />
      <p style={{ fontSize: 12, color: form.password && !passwordValid ? "red" : "#555", margin: "4px 0" }}>
        At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.
      </p>
      <button type="submit">Register</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
