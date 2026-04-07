"use client";

export default function DashboardHomePage() {

  const servicios = [
    {
      id: 1,
      nombre: "Plomería",
      icono: "🔧",
      descripcion: "Reparación de fugas, tuberías y grifos",
    },
    {
      id: 2,
      nombre: "Electricidad",
      icono: "⚡",
      descripcion: "Instalaciones y arreglos eléctricos",
    },
    {
      id: 3,
      nombre: "Pintura",
      icono: "🎨",
      descripcion: "Pintura interior y exterior",
    },
    {
      id: 4,
      nombre: "Cerrajería",
      icono: "🔑",
      descripcion: "Apertura y cambio de cerraduras",
    },
    {
      id: 5,
      nombre: "Jardinería",
      icono: "🌿",
      descripcion: "Cuidado y mantenimiento de jardines",
    },
    {
      id: 6,
      nombre: "Limpieza",
      icono: "🧹",
      descripcion: "Limpieza profunda del hogar",
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        {servicios.map((s) => (
          <div
            key={s.id}
            className="group relative rounded-2xl p-5 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-lg cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:border-orange-500"
          >
            {/* ICONO */}
            <div className="text-3xl mb-3">{s.icono}</div>

            {/* TITULO */}
            <h3 className="font-semibold text-lg">{s.nombre}</h3>

            {/* DESCRIPCIÓN */}
            <p className="text-sm text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {s.descripcion}
            </p>

            {/* EFECTO NARANJA */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 opacity-0 group-hover:opacity-100 transition duration-500"></div>
          </div>
        ))}

      </div>

      {/* RESUMEN */}
      <div className="mt-10 bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-md">
        <h2 className="font-semibold text-white mb-3">
          📊 Resumen rápido
        </h2>

        <div className="flex justify-between text-sm text-gray-400">
          <span>Reservas hoy</span>
          <span className="font-bold text-orange-500">5</span>
        </div>

        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>Servicios activos</span>
          <span className="font-bold text-green-400">12</span>
        </div>
      </div>

    </div>
  );
}