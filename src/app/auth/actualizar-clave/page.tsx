"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ActualizarClavePage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) return alert("La clave debe tener al menos 6 caracteres");

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            alert("✅ ¡Contraseña actualizada con éxito!");
            // Cerramos sesión para que entre limpio al login
            await supabase.auth.signOut();
            router.push("/auth/login");
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#f97316_0%,_transparent_50%)] opacity-20 pointer-events-none" />

            <form
                onSubmit={handleUpdate}
                className="relative z-10 bg-neutral-900 border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
                        Nueva <span className="text-orange-500">Contraseña</span>
                    </h1>
                    <p className="text-neutral-500 text-xs">Establece una clave que no olvides.</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="Nueva contraseña (min. 6 caracteres)"
                        required
                        minLength={6}
                        className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all text-sm"
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <button
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20"
                    >
                        {loading ? "Guardando..." : "Confirmar Nueva Clave →"}
                    </button>
                </div>
            </form>
        </main>
    );
}