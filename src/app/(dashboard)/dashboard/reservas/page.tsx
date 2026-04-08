"use client";

import { useRouter } from "next/navigation";
import { useReservas } from "@/hooks/useReservas";

export default function ReservasPage() {
  const router = useRouter();
  const { reservas, loading, error } = useReservas();

  return (
    <div className="min-h-screen bg-[#111009] p-6 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Mis <span className="text-orange-500">Citas</span>
        </h1>
        <button
          onClick={() => router.push("/dashboard/reservas/nueva")}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-full transition-all"
        >
          + Nueva reserva
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="animate-pulse text-orange-500 font-bold">Verificando usuario y cargando datos...</p>
        ) : reservas.length === 0 ? (
          <p className="text-gray-500">No se encontraron reservas para este perfil.</p>
        ) : (
          reservas.map((r) => (
            <div key={r.id_reserva} className="bg-[#1f1609] border border-[#2e1e0a] p-5 rounded-2xl border-l-4 border-l-orange-500">
              <p className="text-orange-500 font-black mb-2">RESERVA #{r.id_reserva}</p>
              <p className="text-sm text-gray-400">Fecha: {new Date(r.fecha_agenda).toLocaleDateString()}</p>
              <p className="text-sm text-gray-400">Servicio: {r.servicios?.nombre_servicio || 'N/A'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}