"use client";

import { useState } from "react";
import {
  MessageSquare,
  MapPin,
  Clock,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const faqs = [
    {
      q: "¿Cuánto tarda en llegar mi pedido a domicilio?",
      a: "Nuestro tiempo promedio de preparación y entrega express en la ciudad de Valledupar es de 25 a 35 minutos. Puedes ver el estado de preparación en tiempo real desde la sección 'Mis Pedidos'.",
    },
    {
      q: "¿Qué métodos de pago son aceptados?",
      a: "Aceptamos pagos digitales mediante Nequi y Daviplata (a nuestra línea oficial), tarjetas de crédito/débito (Visa, Mastercard) y efectivo contra entrega o directo en caja.",
    },
    {
      q: "¿Cómo funciona la modalidad 'En Mesa'?",
      a: "Si te encuentras dentro del restaurante Towskan, selecciona la opción 'En Mesa' durante el pedido e ingresa el número que aparece en el sticker de tu mesa. El personal de servicio llevará tus hamburguesas directamente sin hacer filas.",
    },
    {
      q: "¿Se aplican costos adicionales de envío o impuestos?",
      a: "Para la modalidad a domicilio, la tarifa fija de envío en el perímetro urbano es de $5.000 COP. Por disposición legal (Estatuto Tributario en Colombia), los restaurantes aplican el 8% de Impuesto Nacional al Consumo sobre platos y bebidas, el cual se desglosa transparentemente en el carrito.",
    },
    {
      q: "¿Tienen hamburguesas de pollo o vegetarianas?",
      a: "Sí, contamos con nuestra deliciosa 'Chicken Volcano Crispy' con pechuga apanada en especias y coleslaw. También podemos personalizar cualquier hamburguesa reemplazando ingredientes al coordinar por WhatsApp.",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !mensaje) return;
    setEnviado(true);
    setTimeout(() => {
      setNombre("");
      setEmail("");
      setMensaje("");
      setEnviado(false);
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-towskan-orange-50 border border-towskan-orange-200 text-towskan-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atención al Cliente</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Centro de Ayuda & Soporte
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          ¿Tienes dudas sobre tu orden o deseas comunicarte con nuestra sede en Valledupar? Estamos para servirte.
        </p>
      </div>

      {/* Canales de Contacto Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <a
          href="https://wa.me/573001234567?text=Hola%20Towskan,%20deseo%20información%20sobre%20mi%20pedido"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-lg transition flex flex-col items-start gap-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">WhatsApp Oficial</h3>
            <p className="text-xs text-gray-500 mt-1">Línea directa para confirmaciones de pago y pedidos especiales.</p>
          </div>
          <span className="text-xs font-black text-emerald-600 mt-2 block">
            Chatear ahora (+57 300 123 4567) →
          </span>
        </a>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-towskan-orange-50 text-towskan-orange-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Horarios de Cocina</h3>
            <p className="text-xs text-gray-500 mt-1">Lunes a Jueves: 12:00 PM – 10:30 PM</p>
            <p className="text-xs text-gray-500">Viernes a Domingo: 12:00 PM – 11:30 PM</p>
          </div>
          <span className="text-xs font-bold text-gray-400 mt-2">Servicio continuo</span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-start gap-3 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Sede Principal</h3>
            <p className="text-xs text-gray-500 mt-1">
              Valledupar, Cesar, Colombia.<br />Zona Gastronómica Central.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 mt-2">Mesas climatizadas y terraza</span>
        </div>
      </div>

      {/* Grid: Preguntas Frecuentes y Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        {/* Preguntas Frecuentes */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-towskan-orange-500" />
            <span>Preguntas Frecuentes</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex justify-between items-center gap-4 hover:bg-gray-50/50 transition"
                  >
                    <span className="text-xs sm:text-sm font-bold text-gray-900">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                        isOpen ? "rotate-180 text-towskan-orange-500" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario de Mensaje */}
        <div className="p-5 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-900">Envíanos un Mensaje</h2>
          <p className="text-xs text-gray-500">
            ¿Tienes sugerencias, quejas o felicitaciones? Escríbenos y te responderemos en breve.
          </p>

          {enviado && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Gracias! Tu mensaje ha sido enviado al equipo de atención.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Mensaje o Consulta *
              </label>
              <textarea
                required
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Describe tu inquietud o el número de pedido correspondiente..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Mensaje</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

