"use client";

import { useEffect, useState } from "react";
import { obtenerReservas } from "@/services/reservasService";

export default function ReservationsList() {
  const [reservas, setReservas] = useState([]);

  const cargarReservas = async () => {
    const { data, error } = await obtenerReservas();
    if (!error) setReservas(data);
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  return (
    <div>
      <h2>Mis Citas</h2>

      {reservas.length === 0 && <p>No hay citas registradas</p>}

      {reservas.map((r) => (
        <div
          key={r.id_reserva}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            background: "#f9f9f9"
          }}
        >
          <h4>Reserva #{r.id_reserva}</h4>
          <p><b>Fecha:</b> {r.fecha_agenda}</p>
          <p><b>Dirección:</b> {r.direccion}</p>
          <p><b>Servicio:</b> {r.descripcion}</p>
        </div>
      ))}
    </div>
  );
}