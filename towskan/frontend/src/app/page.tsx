"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authService, User } from "@/services/auth";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getStoredUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-towskan-cream-50">
      {/* Barra de navegación superior */}
      <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-towskan-orange-500">
              🔥 Towskan
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link href="/" className="text-towskan-orange-500 hover:text-towskan-orange-600 transition">
              Inicio
            </Link>
            <span className="text-gray-400 cursor-not-allowed" title="Disponible en Fase 3">
              Menú
            </span>
            <span className="text-gray-400 cursor-not-allowed" title="Disponible en Fase 3">
              Pedidos
            </span>
            <span className="text-gray-400 cursor-not-allowed" title="Disponible en Fase 3">
              Soporte
            </span>
          </nav>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Hola, <strong>{currentUser.nombre}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg transition"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-towskan-orange-500 transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-towskan-orange-500 hover:bg-towskan-orange-600 rounded-xl shadow-md transition shadow-orange-500/20"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section alineado a -towskan.pdf */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-towskan-orange-50 border border-towskan-orange-100 text-towskan-orange-600 text-xs font-bold uppercase tracking-wider mb-6">
          ⚡ Sabor Express & Calidad Gourmet
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
          El Sabor más Rápido de <br />
          <span className="text-towskan-orange-500">la Ciudad</span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
          Vive la experiencia gourmet a la velocidad de la comida rápida. Carne 100% Angus,
          pan recién horneado y salsas artesanales, entregados directo en tu puerta.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition transform hover:-translate-y-0.5"
          >
            Comenzar Ahora
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold border border-gray-200 rounded-2xl shadow-sm transition"
          >
            Acceder a mi Cuenta
          </Link>
        </div>

        {/* Estado de la Fase 1 */}
        <section className="mt-16 w-full max-w-2xl p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
            Estado de Infraestructura (Fase 1)
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Backend Flask con arquitectura por capas (`controllers`, `services`, `repositories`, `models`).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Base de datos relacional SQLite inicial (con modelo oficial de 6 entidades para MySQL).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Autenticación real (JWT + Bcrypt) conectada al modelo `usuarios`.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Frontend Next.js + Tailwind configurado con paleta Gourmet Towskan.</span>
            </li>
          </ul>
        </section>
      </main>

      {/* Footer básico */}
      <footer className="w-full border-t border-gray-200 py-6 text-center text-xs text-gray-500 bg-white">
        Towskan Web System • SENA ADSO CBC Regional Cesar (2026)
      </footer>
    </div>
  );
}
