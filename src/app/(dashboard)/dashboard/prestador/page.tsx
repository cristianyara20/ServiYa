"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { getPrestadorDashboardData, updateBookingStatus, updatePrestadorAvailability } from './actions';
import { toast, Toaster } from 'react-hot-toast';

export default function PrestadorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solicitudes'); // solicitudes, activos, historial

  const supabase = createBrowserSupabaseClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
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

    // Suscripción en tiempo real para la tabla de reservas
    const channel = supabase
      .channel('reservas_prestador')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los cambios (INSERT, UPDATE, DELETE)
          schema: 'gestion',
          table: 'reservas'
        },
        () => {
          console.log('🔄 Cambio detectado en reservas, actualizando...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusUpdate = async (bookingId: number, status: string, prestadorId?: number) => {
    const loadingToast = toast.loading('Actualizando estado...');
    const result = await updateBookingStatus(bookingId, status, prestadorId);
    if (result.success) {
      toast.success(`Servicio ${status} correctamente`, { id: loadingToast });
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  const solicitudes = data?.reservas?.filter((r: any) => r.estado_reserva === 'pendiente') || [];
  const activos = data?.reservas?.filter((r: any) => r.estado_reserva === 'aceptada') || [];
  const historial = data?.reservas?.filter((r: any) => r.estado_reserva === 'terminada' || r.estado_reserva === 'rechazada') || [];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* HEADER & STATUS */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Panel de Prestador
          </h1>
          <p className="text-neutral-400">
            Bienvenido de nuevo, <span className="text-white font-medium">{data?.perfil?.nombre || data?.perfil?.correo || 'Prestador'}</span>. Gestiona tus servicios aquí.
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-2 rounded-2xl flex gap-2">
          {['disponible', 'ocupado', 'inactivo'].map((status) => (
            <button
              key={status}
              onClick={() => handleAvailabilityToggle(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                data?.perfil?.disponibilidad === status
                  ? status === 'disponible' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                  : status === 'ocupado' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-neutral-400">Completados</span>
                <span className="text-2xl font-bold text-orange-500">{historial.filter((h:any) => h.estado_reserva === 'terminada').length}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-neutral-400">Calificación</span>
                <span className="text-2xl font-bold text-white">⭐ {data?.perfil?.calificacion_promedio || '5.0'}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-neutral-400">Activos</span>
                <span className="text-2xl font-bold text-green-500">{activos.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-600/10 border border-orange-500/20 rounded-3xl p-6">
            <p className="text-orange-500 text-sm font-medium leading-relaxed">
              Recuerda marcar tus servicios como "terminados" para que tus clientes puedan calificarte.
            </p>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3">
          
          {/* TABS */}
          <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto">
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
              className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'historial' ? 'text-white' : 'text-neutral-500'}`}>
              Historial
              {activeTab === 'historial' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          </div>

          {/* LISTS */}
          <div className="space-y-4">
            
            {activeTab === 'solicitudes' && (
              <>
                {solicitudes.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
                    <p className="text-neutral-500">No tienes solicitudes pendientes en este momento.</p>
                  </div>
                ) : (
                  solicitudes.map((res: any) => (
                    <div key={res.id_reserva} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex gap-5 items-center">
                        <div className="bg-orange-500/10 h-14 w-14 rounded-2xl flex items-center justify-center text-2xl">📩</div>
                        <div>
                          <h4 className="font-bold text-lg">{res.subservicio || `Servicio #${res.id_servicio}`}</h4>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            👤 {res.cliente?.nombre
                              ? `${res.cliente.nombre}${res.cliente.apellido ? ' ' + res.cliente.apellido : ''}`
                              : res.cliente?.correo || `Cliente #${res.id_cliente}`}
                          </p>
                          {res.cliente?.correo && <p className="text-xs text-neutral-500">{res.cliente.correo}</p>}
                          <p className="text-xs text-neutral-500 mt-1">🕒 Solicitado: {new Date(res.fecha_solicitud).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => handleStatusUpdate(res.id_reserva, 'aceptada', data?.perfil?.id_usuario)} 
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                          Aceptar
                        </button>
                        <button onClick={() => handleStatusUpdate(res.id_reserva, 'rechazada')} 
                          className="flex-1 md:flex-none bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'activos' && (
              <>
                {activos.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
                    <p className="text-neutral-500">No tienes servicios activos en curso.</p>
                  </div>
                ) : (
                  activos.map((res: any) => (
                    <div key={res.id_reserva} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex gap-5 items-center">
                        <div className="bg-green-500/10 h-14 w-14 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                        <div>
                          <h4 className="font-bold text-lg">{res.subservicio || `Servicio #${res.id_servicio}`}</h4>
                          <p className="text-sm font-semibold text-white mt-1">
                            👤 {res.cliente?.nombre && res.cliente?.apellido 
                              ? `${res.cliente.nombre} ${res.cliente.apellido}` 
                              : res.cliente?.nombre || res.cliente?.correo || `Cliente #${res.id_cliente}`}
                          </p>
                          {res.cliente?.correo && <p className="text-xs text-neutral-500">{res.cliente.correo}</p>}
                          <p className="text-xs text-green-500 mt-1 font-bold italic">📅 Programado para: {new Date(res.fecha_agenda).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button onClick={() => handleStatusUpdate(res.id_reserva, 'terminada')} 
                        className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-orange-600/20">
                        Finalizar Servicio
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'historial' && (
              <div className="overflow-x-auto bg-neutral-900 border border-neutral-800 rounded-3xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {historial.map((res: any) => (
                      <tr key={res.id_reserva} className="border-b border-neutral-800/50 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold">{res.subservicio || res.id_servicio}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">
                            {res.cliente?.nombre
                              ? `${res.cliente.nombre}${res.cliente.apellido ? ' ' + res.cliente.apellido : ''}`
                              : res.cliente?.correo || `Cliente #${res.id_cliente}`}
                          </div>
                          {res.cliente?.correo && <div className="text-xs text-neutral-500">{res.cliente.correo}</div>}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{new Date(res.fecha_agenda).toLocaleDateString()}</td>
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
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
