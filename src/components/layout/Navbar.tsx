"use client";

import Link from "next/link";
import { logoutAction } from "@/app/auth/login/actions";
import type { User } from "@supabase/supabase-js";

export default function Navbar({ user }: { user: User | null }) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* SECCIÓN IZQUIERDA: LOGO */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <div className="leading-tight">
            <p className="font-bold text-purple-700 text-sm">SERVIYA</p>
            <p className="text-[10px] text-gray-400 font-medium">PANEL DE GESTIÓN</p>
          </div>
        </Link>

        {/* SECCIÓN CENTRAL: NAVEGACIÓN PRINCIPAL */}
       <nav className="hidden md:flex items-center gap-6">
  <Link 
    href="/dashboard/reservas" 
    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 transition-colors"
  >
    <span className="text-blue-500 text-sm">🗓️</span> Reservas
  </Link>

  <Link 
    href="/dashboard/calificaciones" 
    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 transition-colors"
  >
    <span className="text-yellow-500 text-sm">⭐</span> Calificaciones
  </Link>

  <Link 
    href="/dashboard/pqrs" 
    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 transition-colors"
  >
    <span className="text-purple-400 text-sm">📩</span> PQRS
  </Link>

  {user?.email === "pepitoperez132604@gmail.com" && (
    <Link 
      href="/dashboard/admin" 
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors"
    >
      <span className="text-red-500 text-sm">🛡️</span> Panel Admin
    </Link>
  )}

  <Link 
    href="/dashboard/chat" 
    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 transition-colors"
  >
    <span className="text-purple-300 text-sm">💬</span> Chat
  </Link>
</nav>

        {/* SECCIÓN DERECHA: BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-4">
          
          {/* BOTÓN SOS */}
          <button className="border-2 border-orange-400 text-orange-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-orange-50 transition-colors uppercase italic">
            <span className="text-xs">🔔</span> SOS
          </button>

          {user && (
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-gray-800 leading-none">Usuario</p>
                <p className="text-[10px] text-blue-500 lowercase">{user.email?.split('@')[0]}@gmail.com</p>
              </div>
              
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-2"
                >
                  <span className="text-xs">🚪</span>
                  Cerrar Sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}