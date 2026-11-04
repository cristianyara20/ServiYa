"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ServiciosPage() {
  const [form, setForm] = useState({
    nombre_servicio: "",
    descripcion: "",
    categoria: "",
  });

  const [servicios, setServicios] = useState<any[]>([]);

  const getServicios = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .schema("gestion")
        .from("servicios")
        .select("*");

      if (error) {
        console.error("Error obteniendo servicios:", error);
      } else {
        setServicios(data || []);
      }
    } catch (err) {
      console.error("Error inesperado al cargar servicios:", err);
    }
  };

  useEffect(() => {
    void getServicios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.schema("gestion").from("servicios").insert(form);
      await getServicios(); // refresca lista
    } catch (err) {
      console.error("Error al registrar servicio:", err);
    }
  };

  return (
    <div>
      <h2>Servicios</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Nombre" onChange={(e)=>setForm({...form,nombre_servicio:e.target.value})}/>
        <input placeholder="Descripción" onChange={(e)=>setForm({...form,descripcion:e.target.value})}/>
        <input placeholder="Categoría" onChange={(e)=>setForm({...form,categoria:e.target.value})}/>
        <button type="submit">Crear</button>
      </form>

      <ul>
        {servicios.map((s) => (
          <li key={s.id_servicio}>
            {s.nombre_servicio} - {s.categoria}
          </li>
        ))}
      </ul>
    </div>
  );
}
