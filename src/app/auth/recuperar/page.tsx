"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const supabase = createBrowserSupabaseClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje("");

        // Apuntamos directo a actualizar-clave para evitar que se pierda la sesión
        const targetURL = `${window.location.origin}/auth/actualizar-clave`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: targetURL,
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            setMensaje("📧 ¡Enviado! Revisa tu correo. RECUERDA: Copia y pega el link en una pestaña de incógnito.");
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#f97316_0%,_transparent_50%)] opacity-20 pointer-events-none" />

            <form
                onSubmit={handleReset}
                className="relative z-10 bg-neutral-900 border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
                        Recuperar <span className="text-orange-500">Cuenta</span>
                    </h1>
                    <p className="text-neutral-500 text-xs">Te enviaremos un enlace seguro para cambiar tu clave.</p>
                </div>

                {mensaje ? (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-center">
                        <p className="text-orange-500 text-sm font-medium">{mensaje}</p>
                        <button
                            type="button"
                            onClick={() => setMensaje("")}
                            className="mt-2 text-[10px] text-neutral-400 underline uppercase hover:text-white"
                        >
                            Intentar con otro correo
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Ingresa tu correo electrónico"
                            required
                            className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20"
                        >
                            {loading ? "Procesando..." : "Enviar Enlace de Acceso →"}
                        </button>
                    </div>
                )}
            </form>
        </main>
    );
}