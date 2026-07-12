"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  user: User | null;
  logoutAction: () => void;
}

export default function Navbar({ user, logoutAction }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(true); // Control de visibilidad del menú lateral (abierto por defecto)
  const pathname = usePathname();

  // Cerrar automáticamente en pantallas pequeñas al cambiar de ruta
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: "Inicio", icon: "🏠", color: "text-orange-500" },
    { href: "/dashboard/reservas", label: "Reservas", icon: "🗓️", color: "text-blue-400" },
    { href: "/dashboard/calificaciones", label: "Calificaciones", icon: "⭐", color: "text-yellow-400" },
    { href: "/dashboard/pqrs", label: "PQRS", icon: "📩", color: "text-purple-400" },
    { href: "/dashboard/chat", label: "Chat", icon: "💬", color: "text-purple-300" },
  ];

  if (user?.user_metadata?.rol === "admin") {
    navLinks.push({ href: "/dashboard/admin", label: "Panel Admin", icon: "🛡️", color: "text-red-400" });
  } else if (user?.user_metadata?.rol === "prestador") {
    navLinks.push({ href: "/dashboard/prestador", label: "Panel Prestador", icon: "🔧", color: "text-green-400" });
  }

  return (
    <>
      {/* HEADER SUPERIOR (BARRA HORIZONTAL COMPACTA) */}
      <header className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm sticky top-0 z-50 transition-colors duration-300 w-full">
        <div className="px-6 py-2.5 flex items-center justify-between">
          
          {/* SECCIÓN IZQUIERDA: BOTÓN MENÚ DE 3 LÍNEAS + LOGO */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="Alternar Menú Lateral"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
              <div className="leading-tight">
                <p className="font-black text-orange-500 text-sm tracking-widest">SERVIYA</p>
                <p className="text-[9px] text-neutral-500 dark:text-neutral-400 font-bold tracking-wider">GESTIÓN</p>
              </div>
            </Link>
          </div>

          {/* SECCIÓN DERECHA: SOS + ROL + MODO OSCURO + LOGOUT */}
          <div className="flex items-center gap-3">
            
            {/* BOTÓN SOS */}
            <button className="border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-500/20 transition-colors uppercase italic shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              <span className="text-xs">🚨</span> SOS
            </button>

            {/* MODO OSCURO */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {user && (
              <div className="flex items-center gap-3 border-l pl-4 border-neutral-200 dark:border-neutral-700">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-neutral-900 dark:text-white tracking-wider leading-none capitalize">
                    👤 {user.user_metadata?.rol || "Usuario"}
                  </p>
                  <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5 lowercase max-w-[130px] truncate">{user.email}</p>
                </div>
                
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-2"
                  >
                    Salir
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MENÚ LATERAL IZQUIERDO DESPLEGABLE */}
      <aside
        className={`fixed left-0 top-[53px] bottom-0 z-40 w-64 bg-white dark:bg-[#0f0f0f] border-r border-neutral-200 dark:border-neutral-800 shadow-md transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-between py-6 px-4">
          
          {/* ENLACES DE NAVEGACIÓN */}
          <nav className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest px-3 mb-4">Navegación</p>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-orange-500/10 text-orange-500 border-l-4 border-orange-500"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <span className={`${link.color} text-base`}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* FIRMA O FOOTER DEL MENÚ */}
          <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl text-[10px] text-neutral-400 leading-relaxed">
            <p className="font-bold text-neutral-500 dark:text-neutral-300 mb-1">ServiYa Go Backend</p>
            <p>Conectado a la base de datos de Supabase de forma segura en tiempo real.</p>
          </div>
        </div>
      </aside>

      {/* ESTILO GLOBAL PARA ADAPTAR EL CONTENIDO DE LA PÁGINA SEGÚN EL MENÚ LATERAL */}
      <style jsx global>{`
        main {
          margin-left: ${isOpen ? "16rem" : "0"};
          transition: margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}