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
            <div key={r.id_reserva} className="bg-white dark:bg-[#1f1609] border border-neutral-200 dark:border-[#2e1e0a] p-5 rounded-2xl border-l-4 border-l-orange-500 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-colors duration-300">
              <p className="text-orange-500 font-black mb-2">RESERVA #{r.id_reserva}</p>
              <p className="text-sm text-neutral-600 dark:text-gray-400">Fecha: {new Date(r.fecha_agenda).toLocaleDateString()}</p>
              <p className="text-sm text-neutral-600 dark:text-gray-400">Servicio: {r.servicios?.nombre_servicio || 'N/A'}</p>
              {r.descripcion && (
                <p className="text-sm text-neutral-600 dark:text-gray-400 mt-2"><span className="font-bold">Opción:</span> {r.descripcion.replace(/: $/, '')}</p>
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