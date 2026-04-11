"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const [mensaje, setMensaje] = useState("");

  const enviar = async () => {
    await supabase.from("comunicacion.mensajes").insert({
      id_chat: 1,
      contenido: mensaje,
      remitente: "Cliente",
    });

    setMensaje("");
  };

  return (
    <div>
      <h2>Chat</h2>
      <input value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
      <button onClick={enviar}>Enviar</button>
    </div>
  );
}