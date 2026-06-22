"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// DTOs adaptados desde Golang
interface PrestadorTop {
  id_prestador: number;
  nombre_prestador: string;
  correo_prestador: string;
  calificacion: number;
  total_servicios: number;
}

interface ReporteConsolidado {
  mes: number;
  anio: number;
  total_reservas: number;
  total_pendientes: number;
  total_aceptadas: number;
  total_completadas: number;
  total_canceladas: number;
  pqrs_abiertas: number;
  top_prestadores: PrestadorTop[];
}

interface ServicioPopular {
  id_servicio: number;
  nombre_servicio: string;
  categoria: string;
  veces_solicitado: number;
}

interface ActividadUsuarios {
  mes: number;
  anio: number;
  usuarios_nuevos: number;
  usuarios_activos: number;
}

export default function ReportesPanel() {
  const supabase = createBrowserSupabaseClient();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  
  const [reporteAdmin, setReporteAdmin] = useState<ReporteConsolidado | null>(null);
  const [servicios, setServicios] = useState<ServicioPopular[]>([]);
  const [actividad, setActividad] = useState<ActividadUsuarios | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const baseUrl = process.env.NEXT_PUBLIC_REPORTES_API_URL || `http://localhost:8080/api/v1/reportes`;
      const query = `?mes=${mes}&anio=${anio}`;

      const [resAdmin, resServicios, resActividad] = await Promise.all([
        fetch(`${baseUrl}/admin${query}`, { headers }),
        fetch(`${baseUrl}/servicios-populares${query}`, { headers }),
        fetch(`${baseUrl}/actividad-usuarios${query}`, { headers })
      ]);

      if (resAdmin.status === 401 || resAdmin.status === 403) {
        throw new Error("No tienes autorización para ver estos datos (Token inválido o expirado).");
      }

      if (!resAdmin.ok || !resServicios.ok || !resActividad.ok) {
        throw new Error("Error al obtener los datos de la API");
      }

      const dataAdmin = await resAdmin.json();
      const dataServicios = await resServicios.json();
      const dataActividad = await resActividad.json();

      setReporteAdmin(dataAdmin);
      setServicios(dataServicios || []);
      setActividad(dataActividad);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo conectar a la API.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const baseUrl = process.env.NEXT_PUBLIC_REPORTES_API_URL || `http://localhost:8080/api/v1/reportes`;
      const res = await fetch(`${baseUrl}/admin/pdf?mes=${mes}&anio=${anio}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error("No se pudo descargar el PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_general_${mes}_${anio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert("Error descargando el PDF. Asegúrate de estar autenticado.");
    }
  };

  useEffect(() => {
    fetchReportes();
  }, [mes, anio]);

  return (
    <div className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm transition-colors duration-300">
      
      {/* Encabezado y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <span className="text-2xl">📊</span> Analíticas y Rendimiento
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Métricas en tiempo real procesadas por el motor de Go</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <select 
            value={mes} 
            onChange={(e) => setMes(Number(e.target.value))}
            className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 cursor-pointer"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Mes {i+1}</option>
            ))}
          </select>
          <select 
            value={anio} 
            onChange={(e) => setAnio(Number(e.target.value))}
            className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          
          <button 
            onClick={downloadPDF}
            className="bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-xl px-4 py-2 font-bold transition-colors flex items-center gap-2 text-sm"
            title="Descargar Reporte en PDF"
          >
            <span>📄</span> PDF
          </button>

          <button 
            onClick={fetchReportes}
            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-4 py-2 font-bold transition-colors flex items-center gap-2 text-sm"
          >
            <span>🔄</span> Refrescar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 font-bold flex items-center gap-3">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-orange-500 font-bold animate-pulse gap-3">
          <span className="text-2xl">⚡</span> Calculando métricas...
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Fila 1: KPI Principal - Total Reservas del Mes */}
          <div className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">📋 Total Reservas del Mes</p>
                <p className="text-5xl font-black text-neutral-900 dark:text-white">
                  {reporteAdmin?.total_reservas || 0}
                </p>
              </div>
              <div className="text-right text-xs font-bold text-neutral-500 space-y-1">
                <p>🟡 Pendientes: <span className="text-yellow-500">{reporteAdmin?.total_pendientes || 0}</span></p>
                <p>🔵 Aceptadas: <span className="text-blue-500">{reporteAdmin?.total_aceptadas || 0}</span></p>
                <p>🟢 Terminadas: <span className="text-green-500">{reporteAdmin?.total_completadas || 0}</span></p>
                <p>🔴 Rechazadas: <span className="text-red-500">{reporteAdmin?.total_canceladas || 0}</span></p>
              </div>
            </div>
            {/* Barra de distribución de estados */}
            {(reporteAdmin?.total_reservas || 0) > 0 && (
              <div className="mt-4 w-full h-3 rounded-full overflow-hidden flex bg-neutral-200 dark:bg-neutral-800">
                <div className="bg-yellow-500 h-full transition-all" style={{ width: `${((reporteAdmin?.total_pendientes || 0) / (reporteAdmin?.total_reservas || 1)) * 100}%` }}></div>
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${((reporteAdmin?.total_aceptadas || 0) / (reporteAdmin?.total_reservas || 1)) * 100}%` }}></div>
                <div className="bg-green-500 h-full transition-all" style={{ width: `${((reporteAdmin?.total_completadas || 0) / (reporteAdmin?.total_reservas || 1)) * 100}%` }}></div>
                <div className="bg-red-500 h-full transition-all" style={{ width: `${((reporteAdmin?.total_canceladas || 0) / (reporteAdmin?.total_reservas || 1)) * 100}%` }}></div>
              </div>
            )}
          </div>

          {/* Fila 2: KPIs Secundarios */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-yellow-500/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all"></div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">⏳ Pendientes</p>
              <p className="text-4xl font-black text-yellow-500">
                {reporteAdmin?.total_pendientes || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-green-500/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">✅ Terminadas</p>
              <p className="text-4xl font-black text-green-500">
                {reporteAdmin?.total_completadas || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-red-500/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">❌ Rechazadas</p>
              <p className="text-4xl font-black text-red-500">
                {reporteAdmin?.total_canceladas || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-orange-500/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">📩 PQRS Abiertas</p>
              <p className="text-4xl font-black text-orange-500">
                {reporteAdmin?.pqrs_abiertas || 0}
              </p>
            </div>
          </div>

          {/* Fila 3: Actividad de Usuarios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">👤 Nuevos Usuarios</p>
              <p className="text-4xl font-black text-cyan-500">
                {actividad?.usuarios_nuevos || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-purple-500/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">🔥 Usuarios Activos</p>
              <p className="text-4xl font-black text-purple-500">
                {actividad?.usuarios_activos || 0}
              </p>
            </div>
          </div>

          {/* Fila 2: Top Prestadores y Servicios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Prestadores */}
            <div className="bg-black/5 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <span className="bg-orange-500/20 text-orange-500 p-1.5 rounded-lg text-sm">🏆</span> 
                Top 3 Prestadores
              </h3>
              
              <div className="space-y-4">
                {reporteAdmin?.top_prestadores?.length ? reporteAdmin.top_prestadores.map((p, i) => (
                  <div key={p.id_prestador} className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl hover:border-orange-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center font-black text-white shrink-0">
                      #{i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.nombre_prestador}</p>
                      <p className="text-xs text-neutral-500 truncate">{p.correo_prestador}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <span>★</span> {p.calificacion.toFixed(1)}
                      </div>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase">{p.total_servicios} svcs</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-sm text-neutral-500 py-4">No hay datos suficientes este mes.</p>
                )}
              </div>
            </div>

            {/* Servicios Más Solicitados */}
            <div className="bg-black/5 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <span className="bg-purple-500/20 text-purple-500 p-1.5 rounded-lg text-sm">🔥</span> 
                Servicios Demandados
              </h3>
              
              <div className="space-y-5">
                {servicios?.length ? servicios.slice(0, 5).map((s, i) => {
                  const maxVeces = Math.max(...servicios.map(x => x.veces_solicitado));
                  const percentage = Math.round((s.veces_solicitado / maxVeces) * 100);
                  
                  return (
                    <div key={s.id_servicio} className="space-y-2">
                      <div className="flex justify-between items-end text-sm">
                        <div>
                          <span className="font-bold">{s.nombre_servicio}</span>
                          <span className="ml-2 text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-md uppercase">{s.categoria}</span>
                        </div>
                        <span className="font-mono font-bold text-orange-500">{s.veces_solicitado}</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-sm text-neutral-500 py-4">Sin datos de servicios para este periodo.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
