"use client";

import { useReservas } from "@/hooks/useReservas";

export default function DashboardHomePage() {
  const { reservas, loading } = useReservas();

  const servicios = [
    {
      id: 1,
      nombre: "Plomería y Agua",
      icono: "💧",
      lista: [
        "Fugas y goteos",
        "Destapado de tuberías",
        "Instalación de sanitarios",
        "Grifos y llaves de agua",
        "Mantenimiento de tanques",
        "Reparación de bombas",
      ],
    },
    {
      id: 2,
      nombre: "Servicios Eléctricos",
      icono: "⚡",
      lista: [
        "Cortocircuitos",
        "Instalación de tomas",
        "Cableado eléctrico",
        "Luminarias y lámparas",
        "Tableros eléctricos",
        "Interruptores y dimers",
      ],
    },
    {
      id: 3,
      nombre: "Servicios de Gas",
      icono: "🔥",
      lista: [
        "Detección de fugas",
        "Instalación de estufas",
        "Calentadores de agua",
        "Conexiones seguras",
        "Mantenimiento preventivo",
        "Certificaciones",
      ],
    },
    {
      id: 4,
      nombre: "Carpintería y Decoración",
      icono: "🪚",
      lista: [
        "Instalación de cortinas",
        "Montaje de estantes",
        "Reparación de muebles",
        "Closets y organizadores",
        "Puertas y marcos",
        "Trabajos en madera",
      ],
    },
    {
      id: 5,
      nombre: "Pintura y Acabados",
      icono: "🎨",
      lista: [
        "Pintura de interiores",
        "Pintura de exteriores",
        "Reparación de grietas",
        "Acabados decorativos",
        "Pintura de techos",
        "Restauración de superficies",
      ],
    },
    {
      id: 6,
      nombre: "Aire Acondicionado",
      icono: "❄️",
      lista: [
        "Instalación de equipos",
        "Mantenimiento preventivo",
        "Reparación de averías",
        "Limpieza de filtros",
        "Recarga de gas",
        "Ventiladores de techo",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          👋 Bienvenido a ServiYa
        </h1>

        <p className="text-gray-400 mt-1">
          Encuentra el servicio que necesitas para tu hogar
        </p>
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {servicios.map((s) => (
          <div
            key={s.id}
            className="group relative rounded-2xl p-5 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-sm overflow-hidden transition-all duration-300 hover:border-orange-500 hover:shadow-orange-500/10 hover:shadow-md"
          >
            {/* CABECERA: ICONO + TITULO */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl shrink-0">
                {s.icono}
              </div>
              <h3 className="font-bold text-base text-white leading-tight">{s.nombre}</h3>
            </div>

            {/* LISTA DE SERVICIOS */}
            <ul className="space-y-1.5 relative z-10">
              {s.lista.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[13px] text-gray-300">
                  <svg className="w-4 h-4 text-green-500 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* EFECTO NARANJA DE FONDO AL PASAR EL MOUSE */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
          </div>
        ))}

      </div>

      {/* HISTORIAL DE CITAS LLAMATIVO */}
      <div className="mt-14 mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-orange-500">🗓️</span> Tu actividad reciente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
             <div className="col-span-full py-10 flex flex-col items-center justify-center space-y-3">
                <span className="flex h-5 w-5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500"></span>
                </span>
                <p className="text-orange-500 font-bold animate-pulse text-sm">Sincronizando información...</p>
             </div>
          ) : reservas.length === 0 ? (
             <div className="col-span-full border border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 bg-neutral-900/30">
               No tienes actividad reciente. ¡Agenda tu primer servicio de mantenimiento!
             </div>
          ) : (
            reservas.slice(0, 4).map((res) => {
              const esActiva = res.estado_reserva === 'Pendiente' || res.estado_reserva === 'Asignado' || res.estado_reserva === 'En Camino';
              const servicioIconMap: Record<string, string> = {
                 '1': '💧', '2': '⚡', '3': '🔥', '4': '🪚', '5': '🎨', '6': '❄️'
              };
              const iconoAsignado = res.id_servicio ? (servicioIconMap[res.id_servicio] || '🔧') : '🔧';
              
              if (esActiva) {
                return (
                  <div key={res.id_reserva} className="bg-gradient-to-br from-neutral-900 to-black border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-orange-500/10 transition-transform hover:-translate-y-1">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center text-2xl shadow-inner border border-orange-500/10">{iconoAsignado}</div>
                         <div>
                           <h3 className="font-bold text-lg text-white leading-tight capitalize">{res.servicios?.nombre_servicio || 'Servicio General'}</h3>
                           <p className="text-orange-500 text-sm font-bold tracking-wide uppercase mt-0.5">{res.estado_reserva}</p>
                         </div>
                       </div>
                       <span className="flex h-3.5 w-3.5 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 shadow-[0_0_10px_#f97316]"></span>
                       </span>
                    </div>
                    
                    <div className="bg-neutral-800/60 rounded-2xl p-4 border border-neutral-700/50 mt-5 backdrop-blur-sm relative z-10">
                       <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-neutral-400 font-medium">Lugar</span>
                          <span className="text-white font-semibold text-right truncate pl-4 max-w-[150px]">{res.direccion || 'Pendiente'}</span>
                       </div>
                       <div className="flex justify-between text-sm mb-3">
                          <span className="text-neutral-400 font-medium">Fecha Programada</span>
                          <span className="text-orange-400 font-mono text-right">{new Date(res.fecha_agenda).toLocaleDateString()} {new Date(res.fecha_agenda).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                       <div className="w-full bg-neutral-900 rounded-full h-2 mt-4 overflow-hidden border border-neutral-800">
                          <div className={`h-full rounded-full w-[${res.estado_reserva === 'Asignado' ? '50%' : '20%'}] bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_#f97316]`} style={{ width: res.estado_reserva === 'Asignado' ? '50%' : '20%' }}></div>
                       </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={res.id_reserva} className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl p-6 relative overflow-hidden transition-transform hover:-translate-y-1">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10 opacity-85 hover:opacity-100 transition-opacity">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center text-2xl shadow-inner border border-green-500/10">{iconoAsignado}</div>
                         <div>
                           <h3 className="font-bold text-lg text-white leading-tight capitalize">{res.servicios?.nombre_servicio || 'Servicio Completado'}</h3>
                           <p className="text-green-500 text-sm font-bold tracking-wide uppercase mt-0.5">{res.estado_reserva}</p>
                         </div>
                       </div>
                       <div className="bg-green-500/20 text-green-500 p-2 rounded-full border border-green-500/20">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                    </div>
                    
                    <div className="bg-neutral-800/40 rounded-2xl p-5 border border-neutral-800 mt-5 opacity-80 hover:opacity-100 transition-opacity relative z-10 space-y-3">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-400 font-medium">ID Reserva</span>
                          <span className="text-neutral-500 font-mono text-xs">#{res.id_reserva}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-400 font-medium">Fecha de atención</span>
                          <span className="text-neutral-300 font-mono text-xs bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                            {new Date(res.fecha_agenda).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                       </div>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
      </div>

    </div>
  );
}