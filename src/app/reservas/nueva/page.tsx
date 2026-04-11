"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { crearReserva } from "@/services/reservasService";

export default function NuevaReserva() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    servicio: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { error } = await crearReserva({
      id_cliente: 1, // 🔥 luego lo hacemos automático
      id_prestador: 1,
      id_servicio: 1,
      fecha_agenda: new Date(),
      direccion: form.direccion,
      descripcion: form.servicio,
    });

    if (error) return alert(error.message);

    alert("Cita agendada");
  };

  const servicios = [
    { nombre: "Plomería y Agua", icon: "💧" },
    { nombre: "Electricidad", icon: "⚡" },
    { nombre: "Gas", icon: "🔥" },
    { nombre: "Carpintería", icon: "🪚" },
    { nombre: "Pintura", icon: "🎨" },
    { nombre: "Aire Acondicionado", icon: "❄️" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "400px",
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ textAlign: "center" }}>📅 Agendar Nueva Cita</h3>

        <input
          placeholder="Nombre Completo"
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          placeholder="Teléfono"
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />

        <input
          placeholder="Email (Opcional)"
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Dirección"
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />

        <p>Tipo de Servicio</p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}>
          {servicios.map((s, i) => (
            <div
              key={i}
              onClick={() => setForm({ ...form, servicio: s.nombre })}
              style={{
                padding: "15px",
                background: form.servicio === s.nombre ? "#ddd" : "white",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                border: "1px solid #ccc"
              }}
            >
              <h3>{s.icon}</h3>
              <p>{s.nombre}</p>
            </div>
          ))}
        </div>

        <button
          type="submit"
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "10px",
            background: "#6a5acd",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Agendar Cita
        </button>
      </form>
    </div>
  );
}