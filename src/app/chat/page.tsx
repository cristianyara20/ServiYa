"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ChatPage() {
  const [mensaje, setMensaje] = useState("");

  const enviar = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.schema("comunicacion").from("mensajes").insert({
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