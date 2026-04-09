"use client";

import { useState } from "react";
import { useReservas } from "@/hooks/useReservas";

export default function CalificacionesPage() {
  const [rating, setRating] = useState(0);
  const { reservas, loading } = useReservas();
  const [citaSeleccionada, setCitaSeleccionada] = useState("");

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center justify-center p-4">

      {/* FONDO GRADIENTE */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

      {/* EFECTO LUZ NARANJA */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-orange-500 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-orange-500 opacity-20 blur-3xl"></div>

      {/* CONTENIDO */}
      <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 shadow-2xl">

        {/* TÍTULO */}
        <h1 className="text-2xl font-bold text-center mb-6">
          ⭐ Califica tu servicio
        </h1>

        {/* SELECT */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">
            Seleccionar Cita
          </label>

          <select 
            className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={citaSeleccionada}
            onChange={(e) => setCitaSeleccionada(e.target.value)}
          >
            <option value="">Seleccione una cita completada</option>
            {reservas.map((r) => (
              <option key={r.id_reserva} value={r.id_reserva}>
                Reserva #{r.id_reserva} - {r.servicios?.nombre_servicio || "Servicio"} - {new Date(r.fecha_agenda).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* ESTRELLAS */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            Calificación
          </p>

          <div className="flex gap-3 text-3xl justify-center">
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer transition-all duration-200 ${
                  rating >= star
                    ? "text-orange-400 scale-110"
                    : "text-gray-600 hover:text-orange-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* TEXTAREA */}
        <div className="mb-5">
          <label className="text-sm text-gray-400">
            Reseña
          </label>

          <textarea
            placeholder="Cuéntanos cómo fue tu experiencia..."
            className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* BOTÓN */}
        <button 
          onClick={() => {
            if (!citaSeleccionada || rating === 0) return alert("Seleccione cita y calificación");
            alert("¡Calificación enviada con éxito!");
            setCitaSeleccionada("");
            setRating(0);
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:scale-[1.03] active:scale-[0.97] text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
        >
          ⭐ Enviar Calificación
        </button>

      </div>

    </div>
  );
}