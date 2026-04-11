"use client";

import { useEffect, useState } from "react";
import { obtenerReservas, crearCalificacion } from "@/services/calificacionesService";

export default function RatingForm() {
  const [reservas, setReservas] = useState([]);
  const [form, setForm] = useState({
    id_reserva: "",
    puntuacion: 0,
    comentario: "",
  });

  useEffect(() => {
    const cargar = async () => {
      const { data } = await obtenerReservas();
      setReservas(data || []);
    };
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_reserva || form.puntuacion === 0) {
      return alert("Completa todos los campos");
    }

    const { error } = await crearCalificacion(form);

    if (error) return alert(error.message);

    alert("Calificación enviada");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h3>📋 Seleccionar Cita Completada</h3>

      {/* SELECT */}
      <select
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        onChange={(e) =>
          setForm({ ...form, id_reserva: e.target.value })
        }
      >
        <option value="">Seleccione una cita</option>
        {reservas.map((r) => (
          <option key={r.id_reserva} value={r.id_reserva}>
            Reserva #{r.id_reserva}
          </option>
        ))}
      </select>

      {/* ESTRELLAS */}
      <h4>⭐ Calificación</h4>
      <div style={{ fontSize: "25px", cursor: "pointer" }}>
        {[1,2,3,4,5].map((n) => (
          <span
            key={n}
            onClick={() => setForm({ ...form, puntuacion: n })}
          >
            {n <= form.puntuacion ? "⭐" : "☆"}
          </span>
        ))}
      </div>

      {/* COMENTARIO */}
      <h4>💬 Reseña</h4>
      <textarea
        placeholder="Cuéntenos sobre su experiencia..."
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        onChange={(e) =>
          setForm({ ...form, comentario: e.target.value })
        }
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "10px",
          background: "#6a5acd",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        ⭐ Enviar Calificación
      </button>
    </div>
  );
}