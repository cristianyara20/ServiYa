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
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .schema("gestion")
      .from("servicios")
      .select("*");

    setServicios(data || []);
  };

  useEffect(() => {
    getServicios();
  }, []);

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    const supabase = createBrowserSupabaseClient();
    await supabase.schema("gestion").from("servicios").insert(form);

    getServicios(); // refresca lista
  };

  return (
    <div>
      <h2>Servicios</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Nombre" onChange={(e)=>setForm({...form,nombre_servicio:e.target.value})}/>
        <input placeholder="Descripción" onChange={(e)=>setForm({...form,descripcion:e.target.value})}/>
        <input placeholder="Categoría" onChange={(e)=>setForm({...form,categoria:e.target.value})}/>
        <button>Crear</button>
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