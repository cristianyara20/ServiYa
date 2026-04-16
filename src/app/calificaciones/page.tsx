"use client";

import RatingForm from "@/components/calificaciones/RatingForm";
import { useReservas } from "@/hooks/useReservas";

export default function CalificacionesPage() {
  const { reservas, loading } = useReservas();

  const handleSubmit = async (data: { id_reserva: string; puntuacion: number; comentario: string }) => {
    // Legacy page — basic alert functionality
    alert("Calificación enviada (legacy page)");
  };

  if (loading) return <div style={{ padding: "20px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <RatingForm reservas={reservas} onSubmit={handleSubmit} />
    </div>
  );
}