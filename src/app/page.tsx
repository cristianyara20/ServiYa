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

      {/* Servicios */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <p className="text-neutral-500 text-sm font-semibold tracking-widest uppercase mb-8">
          Lo que ofrecemos
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔧", label: "Plomería" },
            { icon: "⚡", label: "Electricidad" },
            { icon: "🏠", label: "Limpieza" },
            { icon: "🎨", label: "Pintura" },
          ].map((servicio) => (
            <div
              key={servicio.label}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-orange-500/50 transition-colors"
            >
              <span className="text-3xl">{servicio.icon}</span>
              <p className="text-white font-medium mt-3">{servicio.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
