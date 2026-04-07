import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#f97316_0%,_transparent_50%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-orange-500">S</span>erviya
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">Crea tu cuenta</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <RegisterForm />
        </div>

        <p className="text-center text-neutral-500 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <a href="/auth/login" className="text-orange-500 hover:text-orange-400 transition-colors">
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}