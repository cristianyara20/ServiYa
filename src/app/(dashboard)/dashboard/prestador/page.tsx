"use client";

import React, { useState, useEffect } from 'react';
import { getPrestadorAuthUser, subscribeReservasChanges } from '@/services/prestador/prestadorClientService';
import { getPrestadorDashboardData, updateBookingStatus, updatePrestadorAvailability } from './actions';
import { toast, Toaster } from 'react-hot-toast';
import Pagination from "@/components/ui/Pagination";
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function PrestadorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solicitudes'); // solicitudes, activos, historial
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recientes');
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    const user = await getPrestadorAuthUser();
    if (user) {
      const result = await getPrestadorDashboardData(user.id);
      if (result.success) {
        setData(result);
      } else {
        toast.error("Error al cargar datos: " + result.error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Suscripción en tiempo real para la tabla de reservas (via Service)
    const unsubscribe = subscribeReservasChanges(() => {
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (bookingId: number, status: string, prestadorId?: number) => {
    const loadingToast = toast.loading('Actualizando estado...');
    const result = await updateBookingStatus(bookingId, status, prestadorId);
    if (result.success) {
      toast.success(`Servicio ${status} correctamente`, { id: loadingToast });
      
      // NOTIFICACIÓN A TRAVÉS DE LA API DE GO:
      if (status === 'aceptada' && prestadorId) {
        try {
          const { data: { session } } = await createBrowserSupabaseClient().auth.getSession();
          const token = session?.access_token;
          const apiBaseUrl = process.env.NEXT_PUBLIC_REPORTES_API_URL || `http://localhost:8080/api/v1`;
          
          const bookingData = data?.reservas?.find((r: any) => r.id_reserva === bookingId);
          const clienteId = bookingData?.id_cliente;

          if (clienteId) {
            await fetch(`${apiBaseUrl}/operativo/notificar-aceptacion`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                id_reserva: bookingId,
                id_cliente: clienteId,
                id_prestador: prestadorId,
                estado_reserva: 'aceptada'
              })
            });
            toast.success("¡Cliente notificado por la API de Go!", { duration: 4000 });
          }
        } catch (err) {
          console.error("Error al notificar por la API:", err);
        }
      }

      fetchData();
    } else {
      toast.error("Error: " + result.error, { id: loadingToast });
    }
  };

  const handleAvailabilityToggle = async (newStatus: string) => {
    if (!data?.perfil?.id_usuario) return;
    const loadingToast = toast.loading('Cambiando disponibilidad...');
    const result = await updatePrestadorAvailability(data.perfil.id_usuario, newStatus);
    if (result.success) {
      toast.success(`Ahora estás ${newStatus}`, { id: loadingToast });
      fetchData();
    } else {
      toast.error("Error: " + result.error, { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  const solicitudes = data?.reservas?.filter((r: any) => r.estado_reserva === 'pendiente') || [];
  const activos = data?.reservas?.filter((r: any) => r.estado_reserva === 'aceptada') || [];
  const historial = data?.reservas?.filter((r: any) => r.estado_reserva === 'terminada' || r.estado_reserva === 'rechazada') || [];

  const paginate = (items: any[]) => {
    const sorted = [...items].sort((a, b) => {
      const dateA = new Date(a.fecha_agenda || a.fecha_solicitud || 0).getTime();
      const dateB = new Date(b.fecha_agenda || b.fecha_solicitud || 0).getTime();
      const nameA = a.cliente?.nombre || a.descripcion || '';
      const nameB = b.cliente?.nombre || b.descripcion || '';

      if (sortBy === 'recientes') return dateB - dateA;
      if (sortBy === 'antiguos') return dateA - dateB;
      if (sortBy === 'az') return nameA.localeCompare(nameB);
      if (sortBy === 'za') return nameB.localeCompare(nameA);
      return 0;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      <Toaster position="top-right" />
      
      {/* HEADER & STATUS */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Panel de Prestador
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Bienvenido de nuevo, <span className="text-neutral-900 dark:text-white font-medium">{data?.perfil?.nombre || data?.perfil?.correo || 'Prestador'}</span>. Gestiona tus servicios aquí.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-2 rounded-2xl flex gap-2 shadow-sm dark:shadow-none">
          {['disponible', 'ocupado', 'inactivo'].map((status) => (
            <button
              key={status}
              onClick={() => handleAvailabilityToggle(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                data?.perfil?.disponibilidad === status
                  ? status === 'disponible' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                  : status === 'ocupado' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* STATS BAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Completados</span>
                <span className="text-2xl font-bold text-orange-500">{historial.filter((h:any) => h.estado_reserva === 'terminada').length}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Calificación</span>
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">⭐ {data?.perfil?.calificacion_promedio || '5.0'}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Activos</span>
                <span className="text-2xl font-bold text-green-500">{activos.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-orange-600 via-orange-500 to-red-600 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-orange-500/20 group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none group-hover:bg-white/30 transition-colors"></div>
             
             <div className="text-white relative z-10 text-center mb-6 mt-2">
                <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                   <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/90">Nivel Actual</h3>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl">🏅</span>
                  <p className="text-4xl font-black drop-shadow-md tracking-tight">Experto</p>
                </div>
             </div>

             <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner">
                <div className="flex justify-between items-end mb-3 font-bold uppercase text-white/90">
                   <span className="text-[10px] tracking-widest text-orange-200">Próxima meta</span>
                   <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-md">75%</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2.5 mb-5 overflow-hidden border border-white/5 relative">
                   <div className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-white h-2.5 rounded-full w-[75%] shadow-[0_0_15px_rgba(253,224,71,0.8)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/40 skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                   </div>
                </div>
                
                <p className="text-white/80 text-xs text-center leading-relaxed">
                   ¡Has completado servicios increíbles! Estás a muy poco de subir a rango <strong className="text-white font-black bg-white/10 px-2 py-0.5 rounded-md">Maestro ⭐</strong>.
                </p>
             </div>
             
             <style dangerouslySetInnerHTML={{__html:`
               @keyframes shimmer { 100% { transform: translateX(200%); } }
             `}} />
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3">
          
          {/* TABS */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto justify-between items-end gap-4">
            <div className="flex">
              <button onClick={() => setActiveTab('solicitudes')} 
                className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'solicitudes' ? 'text-orange-500' : 'text-neutral-500'}`}>
                Solicitudes {solicitudes.length > 0 && <span className="ml-2 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{solicitudes.length}</span>}
                {activeTab === 'solicitudes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
              </button>
              <button onClick={() => setActiveTab('activos')} 
                className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'activos' ? 'text-green-500' : 'text-neutral-500'}`}>
                Servicios en Curso {activos.length > 0 && <span className="ml-2 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activos.length}</span>}
                {activeTab === 'activos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
              </button>
              <button onClick={() => setActiveTab('historial')} 
                className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${activeTab === 'historial' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                Historial
                {activeTab === 'historial' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white" />}
              </button>
            </div>
            <div className="pb-3 min-w-max">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="recientes">Recientes primero</option>
                <option value="antiguos">Antiguos primero</option>
                <option value="az">A - Z</option>
                <option value="za">Z - A</option>
              </select>
            </div>
          </div>

          {/* LISTS */}
          <div className="space-y-4">
            
            {activeTab === 'solicitudes' && (
              <>
                {solicitudes.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                    <p className="text-neutral-500">No tienes solicitudes pendientes en este momento.</p>
                  </div>
                ) : (
                  <>
                    {paginate(solicitudes).map((res: any) => (
                      <div key={res.id_reserva} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm dark:shadow-none transition-colors duration-300">
                        <div className="flex gap-5 items-center">
                          <div className="bg-orange-500/10 h-14 w-14 rounded-2xl flex items-center justify-center text-2xl">📩</div>
                          <div>
                            <h4 className="font-bold text-lg">{res.descripcion ? res.descripcion.replace(/: $/, '') : `Servicio #${res.id_servicio}`}</h4>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-0.5">
                              👤 {res.cliente?.nombre
                                ? `${res.cliente.nombre}${res.cliente.apellido ? ' ' + res.cliente.apellido : ''}`
                                : res.cliente?.correo || `Cliente #${res.id_cliente}`}
                            </p>
                            {res.cliente?.correo && <p className="text-xs text-neutral-500">{res.cliente.correo}</p>}
                            <p className="text-xs text-orange-500 mt-1 font-bold italic">📅 Para el: {new Date((res.fecha_agenda || res.fecha_solicitud || '').length === 10 ? (res.fecha_agenda || res.fecha_solicitud) + 'T00:00:00' : (res.fecha_agenda || res.fecha_solicitud)).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                          <button onClick={() => handleStatusUpdate(res.id_reserva, 'aceptada', data?.perfil?.id_usuario)} 
                            className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                            Aceptar
                          </button>
                          <button onClick={() => handleStatusUpdate(res.id_reserva, 'rechazada')} 
                            className="flex-1 md:flex-none bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                    {solicitudes.length > itemsPerPage && (
                      <div className="mt-6 flex justify-center">
                        <Pagination 
                          currentPage={currentPage} 
                          totalPages={Math.ceil(solicitudes.length / itemsPerPage)} 
                          onPageChange={setCurrentPage} 
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === 'activos' && (
              <>
                {activos.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                    <p className="text-neutral-500">No tienes servicios activos en curso.</p>
                  </div>
                ) : (
                  <>
                    {paginate(activos).map((res: any) => (
                      <div key={res.id_reserva} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm dark:shadow-none transition-colors duration-300">
                        <div className="flex gap-5 items-center">
                          <div className="bg-green-500/10 h-14 w-14 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                          <div>
                            <h4 className="font-bold text-lg">{res.descripcion ? res.descripcion.replace(/: $/, '') : `Servicio #${res.id_servicio}`}</h4>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">
                              👤 {res.cliente?.nombre && res.cliente?.apellido 
                                ? `${res.cliente.nombre} ${res.cliente.apellido}` 
                                : res.cliente?.nombre || res.cliente?.correo || `Cliente #${res.id_cliente}`}
                            </p>
                            {res.cliente?.correo && <p className="text-xs text-neutral-500">{res.cliente.correo}</p>}
                            <p className="text-xs text-green-500 mt-1 font-bold italic">📅 Programado para: {new Date((res.fecha_agenda || '').length === 10 ? res.fecha_agenda + 'T00:00:00' : res.fecha_agenda).toLocaleString()}</p>
                          </div>
                        </div>
                        <button onClick={() => handleStatusUpdate(res.id_reserva, 'terminada')} 
                          className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-orange-600/20 cursor-pointer">
                          Finalizar Servicio
                        </button>
                      </div>
                    ))}
                    {activos.length > itemsPerPage && (
                      <div className="mt-6 flex justify-center">
                        <Pagination 
                          currentPage={currentPage} 
                          totalPages={Math.ceil(activos.length / itemsPerPage)} 
                          onPageChange={setCurrentPage} 
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === 'historial' && (
              <div className="overflow-x-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm dark:shadow-none transition-colors duration-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {paginate(historial).map((res: any) => (
                      <tr key={res.id_reserva} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold">{res.descripcion ? res.descripcion.replace(/: $/, '') : res.id_servicio}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {res.cliente?.nombre
                              ? `${res.cliente.nombre}${res.cliente.apellido ? ' ' + res.cliente.apellido : ''}`
                              : res.cliente?.correo || `Cliente #${res.id_cliente}`}
                          </div>
                          {res.cliente?.correo && <div className="text-xs text-neutral-500">{res.cliente.correo}</div>}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{new Date((res.fecha_agenda || '').length === 10 ? res.fecha_agenda + 'T00:00:00' : res.fecha_agenda).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            res.estado_reserva === 'terminada' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {res.estado_reserva}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {historial.length > itemsPerPage && (
                  <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-center">
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={Math.ceil(historial.length / itemsPerPage)} 
                      onPageChange={setCurrentPage} 
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
