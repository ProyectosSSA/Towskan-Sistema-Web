"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authService, User } from "@/services/auth";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, Receipt } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = authService.getStoredUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Menú", href: "/menu" },
    { label: "Pedidos", href: "/pedidos" },
    { label: "Soporte", href: "/soporte" },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition group-hover:scale-110">🔥</span>
          <span className="text-2xl font-black tracking-tight text-towskan-orange-500">
            Towskan
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-700">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-towskan-orange-500 ${
                  isActive ? "text-towskan-orange-500 font-extrabold" : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones derechas (Carrito + Usuario) */}
        <div className="flex items-center gap-3">
          {/* Botón Carrito */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-2xl bg-towskan-orange-50 hover:bg-towskan-orange-100 text-towskan-orange-600 transition flex items-center gap-2"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-black">Mi Orden</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-towskan-orange-500 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Autenticación Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/pedidos"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  <Receipt className="w-3.5 h-3.5 text-towskan-orange-500" />
                  <span>{currentUser.nombre.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:text-towskan-orange-500 transition"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-towskan-orange-500 hover:bg-towskan-orange-600 rounded-xl shadow-sm transition shadow-orange-500/20"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-towskan-orange-500 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-sm font-bold ${
                  pathname === link.href ? "text-towskan-orange-500" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-gray-800">
                  Conectado como <strong>{currentUser.nombre}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold border border-gray-200 rounded-xl text-gray-800"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold bg-towskan-orange-500 text-white rounded-xl"
                >
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

