import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#f97316_0%,_transparent_50%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-orange-500">S</span>erviya
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">Inicia sesión para continuar</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <LoginForm />

          <div className="mt-6 space-y-4 text-center">
            {/* Enlace para Recuperar Contraseña */}
            <div>
              <Link
                href="/auth/recuperar"
                className="text-xs text-neutral-500 hover:text-orange-500 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Separador visual opcional */}
            <div className="border-t border-neutral-800 pt-4">
              <p className="text-sm text-neutral-400">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/auth/register"
                  className="text-orange-500 hover:text-orange-400 font-medium transition-colors underline underline-offset-4"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}