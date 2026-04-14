"use client";

import ReservationsList from "@/components/reservas/CreateReservation";
import { useReservas } from "@/hooks/useReservas";

export default function ReservasPage() {
  const { reservas, loading } = useReservas();

  if (loading) return <div style={{ padding: "20px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <ReservationsList reservas={reservas} />
    </div>
  );
}