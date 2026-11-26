"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        router.push("/");
      } else {
        setErrorMsg(res.error || "No fue posible iniciar sesión. Verifique sus credenciales.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] flex items-center justify-center p-4 sm:p-6 bg-towskan-cream-50">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-100">
        
        {/* Panel Izquierdo de Marca (diseño fiel a -towskan.pdf) */}
        <div className="bg-gradient-to-br from-towskan-orange-500 to-towskan-orange-600 p-6 sm:p-8 md:p-12 text-white flex flex-col justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-xs sm:text-sm font-semibold mb-4 md:mb-8">
            ← Volver al inicio
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-6">
              <span className="text-2xl sm:text-3xl">🔥</span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight">Towskan</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-snug mb-2 md:mb-4">
              Bienvenido de nuevo
            </h2>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Inicia sesión para pedir tus hamburguesas favoritas, acumular puntos y recibir tus pedidos a la velocidad de la luz.
            </p>
          </div>
          <div className="hidden md:block text-xs text-white/60 pt-6 border-t border-white/20 mt-8">
            Towskan Web System • SENA ADSO
          </div>
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">Iniciar sesión</h1>
          <p className="text-xs text-gray-500 mb-5 sm:mb-6">Ingresa tus datos para continuar</p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              ℹ️ {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-towskan-orange-500 focus:ring-towskan-orange-500" />
                <span>Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setInfoMsg("Para recuperar tu contraseña, escríbenos desde la sección de Soporte o al WhatsApp +57 300 123 4567.")
                }
                className="text-towskan-orange-500 hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-towskan-orange-500 hover:bg-towskan-orange-600 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition shadow-orange-500/20 text-sm"
            >
              {loading ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <hr className="border-gray-200" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400">
              O continúe con
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setInfoMsg("La integración con Google OAuth está configurada en backend y requiere llaves de Google Cloud.")
            }
            className="w-full py-3 px-4 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition"
          >
            <span>🌐</span> Continuar con Google
          </button>

          <p className="text-center text-xs text-gray-600 mt-6">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-towskan-orange-500 font-bold hover:underline">
              Crear cuenta gratis
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
