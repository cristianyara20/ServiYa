"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  user: User | null;
  logoutAction: () => void;
}

export default function Navbar({ user, logoutAction }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* SECCIÓN IZQUIERDA: LOGO */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
          <div className="leading-tight">
            <p className="font-bold text-orange-500 text-sm tracking-widest">SERVIYA</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">PANEL DE GESTIÓN</p>
          </div>
        </Link>

        {/* SECCIÓN CENTRAL: NAVEGACIÓN PRINCIPAL */}
       <nav className="hidden md:flex items-center gap-6">
  <Link 
    href="/dashboard/reservas" 
    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
  >
    <span className="text-blue-400 text-sm">🗓️</span> Reservas
  </Link>

  <Link 
    href="/dashboard/calificaciones" 
    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
  >
    <span className="text-yellow-400 text-sm">⭐</span> Calificaciones
  </Link>

  <Link 
    href="/dashboard/pqrs" 
    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
  >
    <span className="text-purple-400 text-sm">📩</span> PQRS
  </Link>

  {user?.user_metadata?.rol === "admin" && (
    <Link 
      href="/dashboard/admin" 
      className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
    >
      <span className="text-red-400 text-sm">🛡️</span> Panel Admin
    </Link>
  )}

  <Link 
    href="/dashboard/chat" 
    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
  >
    <span className="text-purple-300 text-sm">💬</span> Chat
  </Link>
</nav>

        {/* SECCIÓN DERECHA: BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-3">
          
          {/* BOTÓN MODO OSCURO / CLARO */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* BOTÓN SOS */}
          <button className="border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-500/20 transition-colors uppercase italic shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <span className="text-xs">🚨</span> SOS
          </button>

          {user && (
            <div className="flex items-center gap-3 border-l pl-4 border-neutral-200 dark:border-neutral-700">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-neutral-900 dark:text-white tracking-wider leading-none capitalize">
                  {user.user_metadata?.rol || "Usuario"}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 lowercase">{user.email || "cargando..."}</p>
              </div>
              
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-2"
                >
                  <span className="text-xs">🚪</span>
                  Salir
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}