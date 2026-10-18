"use client";

import { useState } from "react";
import { createPqrs } from "@/services/pqrs/pqrsClientService";

export default function PqrsPage() {
  const [form, setForm] = useState({
    id_cliente: "",
    id_reserva: "",
    tipo_pqr: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        id_cliente: Number(form.id_cliente),
        id_reserva: Number(form.id_reserva),
        tipo_pqr: form.tipo_pqr,
        descripcion: form.descripcion,
      };

      await createPqrs(payload);

      alert("✅ PQRS enviada con éxito");

      setForm({
        id_cliente: "",
        id_reserva: "",
        tipo_pqr: "",
        descripcion: "",
      });
    } catch (error: any) {
      console.error("Error al enviar PQRS:", error);
      alert("❌ Error al enviar: " + (error?.message || error));
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          style={{
            padding: "12px",
            background: loading ? "#999" : "#6a5acd",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Enviando a la API..." : "Enviar PQRS"}
        </button>
      </form>
    </div>
  );
}