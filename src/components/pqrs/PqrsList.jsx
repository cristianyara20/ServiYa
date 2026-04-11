"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PqrsList() {
  const [pqrs, setPqrs] = useState([]);

  const cargarPqrs = async () => {
    const { data, error } = await supabase
      .schema("soporte")
      .from("pqrs")
      .select("*")
      .order("id_pqr", { ascending: false });

    if (!error) setPqrs(data);
  };

  useEffect(() => {
    cargarPqrs();
  }, []);

  return (
    <div>
      <h2>Mis PQRS</h2>

      {pqrs.length === 0 && <p>No hay PQRS</p>}

      {pqrs.map((p) => (
        <div key={p.id_pqr} style={{
          border: "1px solid #ccc",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "8px"
        }}>
          <p><b>ID:</b> {p.id_pqr}</p>
          <p><b>Tipo:</b> {p.tipo_pqr}</p>
          <p><b>Descripción:</b> {p.descripcion}</p>
          <p><b>Estado:</b> {p.estado_pqr}</p>
        </div>
      ))}
    </div>
  );
}