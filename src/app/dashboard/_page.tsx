"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // Redirigir al home limpio
  };

  if (loading) return <p style={{ padding: "20px" }}>Cargando...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>🏠 SERVIYA</h2>

        <div>
          {!user ? (
            <>
              <Link href="/auth/login"><button style={{ marginRight: "10px", padding: "8px 15px", cursor: "pointer" }}>Iniciar Sesión</button></Link>
              <Link href="/auth/register"><button style={{ marginRight: "10px", padding: "8px 15px", background: "#6a5acd", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Registrarse</button></Link>
            </>
          ) : (
            <>
              <span style={{ marginRight: "10px" }}>👤 {user.email}</span>
              <button onClick={handleLogout} style={{ marginRight: "10px", padding: "8px 15px", cursor: "pointer" }}>Cerrar Sesión</button>
            </>
          )}
          <button style={{ background: "green", color: "white", marginRight: "10px", padding: "8px 15px", border: "none", borderRadius: "5px" }}>+57 300 123 4567</button>
          <button style={{ background: "red", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px" }}>Emergencias 24/7</button>
        </div>
      </div>

      {/* NAV - Solo "Información" siempre visible, el resto solo si hay USER */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Link href="#"><button>Información</button></Link>
        
        {user && (
          <>
            <Link href="/reservas/nueva"><button>Agendar Cita</button></Link>
            <Link href="/reservas"><button>Mis Citas</button></Link>
            <Link href="/calificaciones"><button>Calificar</button></Link>
            <Link href="#"><button>Mis Reseñas</button></Link>
            <Link href="/pqrs"><button>Crear PQR</button></Link>
          </>
        )}
      </div>

      {/* HERO */}
      <div style={{
        background: "linear-gradient(90deg, #6a5acd, #8a2be2)",
        color: "white",
        padding: "30px",
        borderRadius: "15px",
        marginBottom: "20px"
      }}>
        <h3>🏠 SERVIYA - Servicios Completos para el Hogar</h3>
        <p>Soluciones profesionales y confiables para su hogar.</p>
      </div>

      {/* SERVICIOS - Siempre visibles para atraer clientes */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px"
      }}>
        {[
          { nombre: "Plomería y Agua", desc: "Fugas e instalaciones", icon: "💧" },
          { nombre: "Electricidad", desc: "Reparaciones eléctricas", icon: "⚡" },
          { nombre: "Gas", desc: "Detección de fugas", icon: "🔥" },
          { nombre: "Carpintería", desc: "Muebles y reparaciones", icon: "🪚" },
          { nombre: "Pintura", desc: "Acabados profesionales", icon: "🎨" },
          { nombre: "Aire Acondicionado", desc: "Mantenimiento técnico", icon: "❄️" }
        ].map((s, i) => (
          <div key={i} style={{
            padding: "20px",
            borderRadius: "10px",
            background: "#f5f5f5",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
            <h3>{s.icon}</h3>
            <h4>{s.nombre}</h4>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}