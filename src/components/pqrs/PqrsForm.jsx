"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PqrsList from "@/components/pqrs/PqrsList";

export default function Home() {
  const [form, setForm] = useState({
    tipo: "Petición",
    descripcion: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      id_cliente: 1, // 🔥 Luego hacerlo dinámico con el ID del usuario logueado
      id_reserva: 1,
      tipo_pqr: form.tipo,
      descripcion: form.descripcion,
      estado_pqr: "Abierto",
    };

    const { data, error } = await supabase
      .from("soporte.pqrs")
      .insert([payload])
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert("❌ ERROR: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("❌ No se insertó nada");
      return;
    }

    alert("✅ PQR Insertado correctamente");
    setForm({ ...form, descripcion: "" }); // Limpiar campo
  };

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
          <button style={{ marginRight: "10px" }}>Usuario Demo</button>
          <button style={{ marginRight: "10px" }}>Cerrar Sesión</button>
          <button style={{ background: "green", color: "white", marginRight: "10px" }}>+57 300 123 4567</button>
          <button style={{ background: "red", color: "white" }}>Emergencias 24/7</button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Link href="#"><button>Información</button></Link>
        <Link href="/reservas/nueva"><button>Agendar Cita</button></Link>
        <Link href="/reservas"><button>Mis Citas</button></Link>
        <Link href="/calificaciones"><button>Calificar</button></Link>
        <Link href="#"><button>Mis Reseñas</button></Link>
        <Link href="/pqrs"><button>Crear PQR</button></Link>
      </div>

      {/* HERO & SERVICIOS (Resumidos para brevedad) */}
      <div style={{ background: "linear-gradient(90deg, #6a5acd, #8a2be2)", color: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>🏠 SERVIYA - Servicios Completos para el Hogar</h3>
        <p>Soluciones profesionales y confiables.</p>
      </div>

      {/* SECCIÓN PQRS */}
      <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>📩 Peticiones, Quejas y Reclamos</h2>
        
        {/* Formulario integrado directamente */}
        <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto", background: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
          <label>Tipo de PQR:</label>
          <select 
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
            onChange={(e) => setForm({...form, tipo: e.target.value})}
          >
            <option value="Petición">Petición</option>
            <option value="Queja">Queja</option>
            <option value="Reclamo">Reclamo</option>
            <option value="Sugerencia">Sugerencia</option>
          </select>

          <label>Descripción:</label>
          <textarea 
            style={{ width: "100%", padding: "10px", margin: "10px 0", minHeight: "100px" }}
            value={form.descripcion}
            onChange={(e) => setForm({...form, descripcion: e.target.value})}
            placeholder="Escribe aquí tu mensaje..."
            required
          />
          <button type="submit" style={{ width: "100%", padding: "10px", background: "#6a5acd", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Enviar PQR
          </button>
        </form>

        <hr style={{ margin: "30px 0", opacity: 0.3 }} />
        <PqrsList />
      </div>
    </div>
  );
}