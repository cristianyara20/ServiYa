"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReservas } from "@/hooks/useReservas";
import Pagination from "@/components/ui/Pagination";

export default function ReservasPage() {
  const router = useRouter();
  const { reservas, loading, error } = useReservas();

  // Estados de paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recientes');
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Ordenamiento
  const getSortedData = () => {
    return [...reservas].sort((a, b) => {
      if (sortBy === 'recientes') return new Date(b.fecha_agenda || 0).getTime() - new Date(a.fecha_agenda || 0).getTime();
      if (sortBy === 'antiguos') return new Date(a.fecha_agenda || 0).getTime() - new Date(b.fecha_agenda || 0).getTime();
      if (sortBy === 'az') return (a.servicios?.nombre_servicio || '').localeCompare(b.servicios?.nombre_servicio || '');
      if (sortBy === 'za') return (b.servicios?.nombre_servicio || '').localeCompare(a.servicios?.nombre_servicio || '');
      return 0;
    });
  };

  // Cálculos de paginación
  const sortedReservas = getSortedData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservas = sortedReservas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedReservas.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <span className="bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Pendiente</span>;
      case 'aceptada': return <span className="bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Aceptada / En Curso</span>;
      case 'terminada': return <span className="bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Realizada</span>;
      case 'cancelada': return <span className="bg-neutral-500/10 text-neutral-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase line-through">Cancelada</span>;
      case 'rechazada': return <span className="bg-red-500/10 text-red-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Rechazada</span>;
      default: return <span className="bg-neutral-500/10 text-neutral-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">{estado}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#111009] p-6 text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
          Mis <span className="text-orange-500">Citas</span>
        </h1>
        <div className="flex gap-4 items-center">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-[#1f1609] border border-neutral-200 dark:border-[#2e1e0a] text-neutral-900 dark:text-white text-sm rounded-full px-4 py-2 outline-none focus:border-orange-500 transition-colors cursor-pointer shadow-sm dark:shadow-none"
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>
          <button
            onClick={() => router.push("/dashboard/reservas/nueva")}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-full transition-all cursor-pointer"
          >
            + Nueva reserva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="animate-pulse text-orange-500 font-bold">Verificando usuario y cargando datos...</p>
        ) : reservas.length === 0 ? (
          <p className="text-neutral-500 dark:text-gray-500">No se encontraron reservas para este perfil.</p>
        ) : (
          currentReservas.map((r) => (
            <div key={r.id_reserva} className={`bg-white dark:bg-[#1f1609] border border-neutral-200 dark:border-[#2e1e0a] p-5 rounded-2xl border-l-4 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-colors duration-300 ${r.estado_reserva === 'cancelada' || r.estado_reserva === 'rechazada' ? 'border-l-neutral-400 opacity-75' : r.estado_reserva === 'terminada' ? 'border-l-green-500' : r.estado_reserva === 'aceptada' ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
              <p className="font-black mb-3 flex justify-between items-center">
                <span className={r.estado_reserva === 'terminada' ? 'text-green-600' : r.estado_reserva === 'cancelada' ? 'text-neutral-500' : 'text-orange-500'}>RESERVA #{r.id_reserva}</span>
                {getEstadoBadge(r.estado_reserva)}
              </p>
              <p className="text-sm text-neutral-600 dark:text-gray-400">Fecha y Hora: {new Date(r.fecha_agenda).toLocaleString()}</p>
              <p className="text-sm text-neutral-600 dark:text-gray-400">Servicio: {r.servicios?.nombre_servicio || 'N/A'}</p>
              {r.descripcion && (
                <p className="text-sm text-neutral-600 dark:text-gray-400 mt-2"><span className="font-bold">Opción:</span> {r.descripcion.replace(/: $/, '')}</p>
              )}
              
              {(r.estado_reserva === 'pendiente' || r.estado_reserva === 'aceptada') && (
                <div className="mt-4 flex justify-end">
                <form action={async (formData) => {
                  const { cancelarReservaAction } = await import("@/services/reservas/reserva.actions");
                  formData.append("id", r.id_reserva.toString());
                  formData.append("idCliente", r.id_cliente.toString());
                  const res = await cancelarReservaAction(null, formData);
                  if (res.success) {
                    alert("Reserva cancelada con éxito");
                  } else {
                    alert(res.message);
                  }
                }}>
                  <button type="submit" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1 rounded-lg text-sm font-bold transition-colors cursor-pointer">
                    Cancelar Reserva
                  </button>
                </form>
              </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Control de paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}