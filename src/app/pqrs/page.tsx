"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PqrsPage() {
  const [form, setForm] = useState({
    id_cliente: "",
    id_reserva: "",
    tipo_pqr: "",
    descripcion: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      id_cliente: Number(form.id_cliente),
      id_reserva: Number(form.id_reserva),
      tipo_pqr: form.tipo_pqr, // ✅ nombre correcto
      descripcion: form.descripcion,
      estado_pqr: "Abierto", // ✅ nombre correcto según tu BD
    };

    const { error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .insert([payload]);

    if (error) {
      console.error("Error de Supabase:", error);
      return alert("❌ Error al enviar: " + error.message);
    }

    alert("✅ PQRS enviada con éxito");

    setForm({
      id_cliente: "",
      id_reserva: "",
      tipo_pqr: "",
      descripcion: "",
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2 style={{ textAlign: "center" }}>📩 Radicar PQRS</h2>

        <input
          type="number"
          placeholder="ID Cliente"
          value={form.id_cliente}
          onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
          style={{ padding: "10px" }}
          required
        />

        <input
          type="number"
          placeholder="ID Reserva"
          value={form.id_reserva}
          onChange={(e) => setForm({ ...form, id_reserva: e.target.value })}
          style={{ padding: "10px" }}
          required
        />

        {/* ✅ SELECT CORRECTO */}
        <select
          value={form.tipo_pqr}
          onChange={(e) => setForm({ ...form, tipo_pqr: e.target.value })}
          style={{ padding: "10px" }}
          required
        >
          <option value="">Seleccione Tipo</option>
          <option value="Peticion">Petición</option>
          <option value="Queja">Queja</option>
          <option value="Reclamo">Reclamo</option>
          <option value="Sugerencia">Sugerencia</option>
        </select>

        <textarea
          placeholder="Descripción del problema"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          style={{ padding: "10px", minHeight: "100px" }}
          required
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            background: "#6a5acd",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Enviar PQRS
        </button>
      </form>
    </div>
  );
}