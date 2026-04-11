import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#f97316_0%,_transparent_50%)] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#ea580c_0%,_transparent_50%)] opacity-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-orange-500">S</span>erviya
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/register"
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Registrarse
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Iniciar sesión →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-3xl">
          <p className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-6">
            Servicios a domicilio · Colombia
          </p>
          <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tight mb-8">
            Tu hogar,
            <br />
            <span className="text-orange-500">en buenas</span>
            <br />
            manos.
          </h1>
          <p className="text-neutral-400 text-xl max-w-xl mb-12 leading-relaxed">
            Conectamos personas con los mejores prestadores de servicios del país. Rápido, confiable y transparente.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/register"
              className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-full transition-colors text-sm"
            >
              Comenzar ahora
            </Link>
            <Link
              href="/auth/login"
              className="text-neutral-400 hover:text-white font-medium text-sm transition-colors"
            >
              ¿Ya tienes cuenta? Entra aquí →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-24 max-w-2xl">
          {[
            { value: "+500", label: "Prestadores activos" },
            { value: "+2.000", label: "Servicios completados" },
            { value: "4.8★", label: "Calificación promedio" },
          ].map((stat) => (
            <div key={stat.label} className="border-l border-neutral-800 pl-6">
              <p className="text-3xl font-bold text-orange-500">{stat.value}</p>
              <p className="text-neutral-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Por qué elegir SERVIYA?</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Comprometidos con la excelencia y la satisfacción del cliente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🛡️", title: "Técnicos Certificados", desc: "Personal especializado y certificado en cada área de trabajo" },
            { icon: "⏰", title: "Servicio 24/7", desc: "Disponibles para emergencias las 24 horas del día" },
            { icon: "✅", title: "Garantía Total", desc: "Garantizamos la calidad de todos nuestros servicios" },
            { icon: "🔧", title: "Herramientas Pro", desc: "Equipos modernos y especializados para cada trabajo" },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all hover:-translate-y-1 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-3xl mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios técnicos para mantener su hogar en perfectas condiciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "💧", title: "Plomería y Agua", desc: "Fugas, destapados, instalaciones de sanitarios y grifos" },
            { icon: "⚡", title: "Servicios Eléctricos", desc: "Instalaciones eléctricas, cortocircuitos y luminarias" },
            { icon: "🔥", title: "Servicios de Gas", desc: "Instalaciones seguras, detección de fugas, calentadores" },
            { icon: "🪚", title: "Carpintería", desc: "Cortinas, estantes, muebles, closets y organizadores" },
            { icon: "🎨", title: "Pintura y Acabados", desc: "Pintura interior/exterior, acabados decorativos" },
            { icon: "❄️", title: "Aire Acondicionado", desc: "Instalación, mantenimiento y reparación de A/C" },
          ].map((servicio) => (
            <div
              key={servicio.title}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all hover:-translate-y-1 flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-3xl mb-6">
                {servicio.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{servicio.title}</h3>
              <p className="text-neutral-400">{servicio.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/auth/register"
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg inline-flex items-center gap-2"
          >
            Ver Todos los Servicios y Agendar →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#0f0f0f] pt-16 pb-8 relative z-10 w-full px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Columna Marca */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold tracking-tight mb-4 inline-block">
              <span className="text-orange-500">S</span>ERVIYA
            </span>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Tu aliado de confianza para todos los servicios del hogar. Calidad, confiabilidad y excelencia en cada trabajo.
            </p>
          </div>

          {/* Columna Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-center gap-3">
                <span className="text-lg">📞</span> +57 300 123 4567
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">🕒</span> Lun-Vie: 8AM-6PM
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">⚠️</span> Emergencias: 24/7
              </li>
            </ul>
          </div>

          {/* Columna Servicios */}
          <div>
            <h4 className="text-white font-semibold mb-6">Servicios</h4>
            <div className="flex gap-8">
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>• Plomería</li>
                <li>• Gas</li>
                <li>• Pintura</li>
                <li>• Cerrajería</li>
              </ul>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>• Electricidad</li>
                <li>• Carpintería</li>
                <li>• Aire A/C</li>
                <li>• Limpieza</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto border-t border-neutral-800 pt-8 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-500 text-sm mb-2">
            © 2024 SERVIYA. Todos los derechos reservados.
          </p>
          <p className="text-neutral-500 text-sm flex items-center gap-2">
            ✨ Soluciones completas para su hogar
          </p>
        </div>
      </footer>
    </main>
  );
}
