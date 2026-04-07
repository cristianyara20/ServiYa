"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ActualizarClavePage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const supabase = createBrowserSupabaseClient();
    const router = useRouter();

    useEffect(() => {
        // PLAN B: Forzar sesión si venimos de un enlace de recuperación
        const forzarSesion = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            // Si no hay sesión, revisamos si el token viene en la URL (#access_token=...)
            if (!session && window.location.hash) {
                console.log("Intentando recuperar sesión del hash de la URL...");
                await supabase.auth.refreshSession();
            }
        };
        forzarSesion();
    }, [supabase]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: "", texto: "" });

        // Intentamos la actualización
        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            // Si dice "session missing", es que el token se quemó o no se guardó
            if (error.message.includes("session missing")) {
                setMensaje({
                    tipo: "error",
                    texto: "Error: Sesión no encontrada. Por favor, solicita un nuevo correo y ábrelo en INCÓGNITO."
                });
            } else {
                setMensaje({ tipo: "error", texto: error.message });
            }
            setLoading(false);
        } else {
            setMensaje({ tipo: "success", texto: "✅ ¡Contraseña actualizada con éxito!" });
            setTimeout(() => router.push("/auth/login"), 2000);
        }
    };

    return (
        <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 text-white">
            <form onSubmit={handleUpdate} className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 w-full max-w-md space-y-6">
                <h1 className="text-2xl font-bold text-center">Nueva <span className="text-orange-500">Contraseña</span></h1>

                {mensaje.texto && (
                    <div className={`p-3 rounded text-xs text-center ${mensaje.tipo === "error" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                        {mensaje.texto}
                    </div>
                )}

                <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full bg-black border border-neutral-800 p-3 rounded-xl outline-none focus:border-orange-500"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    disabled={loading}
                    className="w-full bg-orange-500 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-orange-400 disabled:opacity-50"
                >
                    {loading ? "Procesando..." : "Actualizar ahora"}
                </button>
            </form>
        </main>
    );
}