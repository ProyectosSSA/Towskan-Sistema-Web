import Link from "next/link";
import { Phone, MapPin, Clock, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white text-gray-600 text-xs">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Columna 1: Marca */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-black tracking-tight text-towskan-orange-500">
              Towskan
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Sabor express & calidad gourmet. Carne 100% Angus, ingredientes frescos y entrega inmediata a domicilio, para llevar o en mesa.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO/IEC 25010 & Ley 1581 de 2012</span>
          </div>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Navegación
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-towskan-orange-500 transition">
                Inicio / Promociones
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-towskan-orange-500 transition">
                Menú y Catálogo
              </Link>
            </li>
            <li>
              <Link href="/pedidos" className="hover:text-towskan-orange-500 transition">
                Mis Pedidos y Facturas
              </Link>
            </li>
            <li>
              <Link href="/soporte" className="hover:text-towskan-orange-500 transition">
                Centro de Ayuda & FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Horarios y Atención */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Horarios de Atención
          </h4>
          <ul className="space-y-2 text-gray-500">
            <li className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 mt-0.5 text-towskan-orange-500 shrink-0" />
              <span>Lunes a Jueves: 12:00 PM – 10:30 PM</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 mt-0.5 text-towskan-orange-500 shrink-0" />
              <span>Viernes a Domingo: 12:00 PM – 11:30 PM</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 mt-0.5 text-towskan-orange-500 shrink-0" />
              <span>Línea Directa / WhatsApp: +57 300 123 4567</span>
            </li>
          </ul>
        </div>

        {/* Columna 4: Ubicación y SENA */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Sede Principal
          </h4>
          <p className="flex items-start gap-2 text-gray-500">
            <MapPin className="w-4 h-4 mt-0.5 text-towskan-orange-500 shrink-0" />
            <span>Valledupar, Cesar, Colombia.<br />Zona Gastronómica Central.</span>
          </p>
          <div className="pt-2 text-[11px] text-gray-400">
            Proyecto formativo ADSO • SENA Centro Biotecnológico del Caribe (CBC).
          </div>
        </div>

      </div>

      <div className="border-t border-gray-100 py-4 text-center text-[11px] text-gray-400">
        © 2026 Towskan Sistema Web. Todos los derechos reservados.
      </div>
    </footer>
  );
}

