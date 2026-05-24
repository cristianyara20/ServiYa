"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePQRS } from "@/hooks/usePQRS";
import Pagination from "@/components/ui/Pagination";

type EstadoType = "Abierto" | "En Proceso" | "Cerrado";
type TipoType = "Peticion" | "Queja" | "Reclamo" | "Sugerencia";

const estadoConfig: Record<EstadoType, { color: string; dot: string }> = {
  "Abierto":    { color: "text-orange-500 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-500" },
  "En Proceso": { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", dot: "bg-yellow-400" },
  "Cerrado":    { color: "text-[#555] bg-white/5 border-white/10",                dot: "bg-[#555]" },
};

const tipoConfig: Record<TipoType, { icon: string; color: string }> = {
  "Peticion":   { icon: "📋", color: "text-blue-400" },
  "Queja":      { icon: "⚠️", color: "text-orange-400" },
  "Reclamo":    { icon: "🔴", color: "text-red-400" },
  "Sugerencia": { icon: "💡", color: "text-yellow-400" },
};

export default function PqrsPage() {
  const router = useRouter();
  const { pqrs, loading, error } = usePQRS();

  // Estados de paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recientes');
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Ordenamiento
  const getSortedData = () => {
    return [...pqrs].sort((a, b) => {
      if (sortBy === 'recientes') return new Date(b.fecha_pqr || 0).getTime() - new Date(a.fecha_pqr || 0).getTime();
      if (sortBy === 'antiguos') return new Date(a.fecha_pqr || 0).getTime() - new Date(b.fecha_pqr || 0).getTime();
      if (sortBy === 'az') return (a.tipo_pqr || '').localeCompare(b.tipo_pqr || '');
      if (sortBy === 'za') return (b.tipo_pqr || '').localeCompare(a.tipo_pqr || '');
      return 0;
    });
  };

  // Cálculos de paginación
  const sortedPqrs = getSortedData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPqrs = sortedPqrs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPqrs.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#111009] p-6 text-neutral-900 dark:text-white transition-colors duration-300">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-bold mb-1">
            Panel de gestión
          </p>
          <h1 className="text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">
            PQ<span className="text-orange-500">RS</span>
          </h1>
        </div>
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
            onClick={() => router.push("/dashboard/pqrs/nueva")}
            className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all mt-1 cursor-pointer"
          >
            + Nueva PQRS
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total",      value: pqrs.length,                                        color: "text-neutral-900 dark:text-white" },
          { label: "Abiertos",   value: pqrs.filter(p => p.estado_pqr === "Abierto" || !p.estado_pqr).length,    color: "text-orange-500" },
          { label: "En Proceso", value: pqrs.filter(p => p.estado_pqr === "En Proceso").length, color: "text-yellow-400" },
          { label: "Cerrados",   value: pqrs.filter(p => p.estado_pqr === "Cerrado").length,    color: "text-neutral-400 dark:text-[#555]" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#1f1609] border border-neutral-200 dark:border-[#2e1e0a] rounded-2xl px-4 py-3 shadow-sm dark:shadow-none transition-colors duration-300">
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 dark:text-[#555] font-bold mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-neutral-500 dark:text-[#ccc] text-sm font-bold">Cargando tus PQRS...</p>}
        {!loading && pqrs.length === 0 && <p className="text-neutral-500 dark:text-[#ccc] text-sm font-bold">No tienes PQRS registradas.</p>}
        {currentPqrs.map((p) => {
          const estado = estadoConfig[p.estado_pqr as EstadoType] || estadoConfig["Abierto"];
          const tipo = tipoConfig[p.tipo_pqr as TipoType] || tipoConfig["Queja"];
          return (
            <div
              key={p.id_pqr}
              onClick={() => router.push(`/dashboard/pqrs/${p.id_pqr}`)}
              className="group bg-white dark:bg-[#1f1609] border border-neutral-200 dark:border-[#2e1e0a] hover:border-orange-500 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden shadow-sm dark:shadow-none"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-neutral-900 dark:text-white text-base uppercase tracking-wide">
                  PQRS #{p.id_pqr}
                </span>
                <span className={`text-[11px] font-bold border rounded-full px-2.5 py-0.5 uppercase tracking-wide flex items-center gap-1.5 ${estado.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                  {p.estado_pqr || "Abierto"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0" />
                <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-[#555] font-bold">Tipo</span>
                <span className={`text-sm font-bold ml-auto flex items-center gap-1 ${tipo.color}`}>
                  {tipo.icon} {p.tipo_pqr}
                </span>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0 mt-1.5" />
                <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-[#555] font-bold shrink-0">Desc.</span>
                <span className="text-sm text-neutral-700 dark:text-[#ccc] ml-auto text-right leading-tight">{p.descripcion}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 flex-shrink-0" />
                <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-[#555] font-bold">Reserva</span>
                <span className="text-sm font-semibold text-neutral-700 dark:text-[#ccc] ml-auto">#{p.id_reserva}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-[#2e1e0a] flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 dark:text-[#444] uppercase tracking-widest font-bold">Ver detalle</span>
                <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <span className="text-orange-500 text-xs font-black">→</span>
                </div>
              </div>
            </div>
          );
        })}
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