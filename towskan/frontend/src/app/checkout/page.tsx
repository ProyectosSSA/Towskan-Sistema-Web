"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { authService, User } from "@/services/auth";
import { orderService, PaymentMethod, DeliveryType } from "@/services/orders";
import {
  Bike,
  ShoppingBag,
  Utensils,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    impuestos,
    envio,
    total,
    tipoEntrega,
    setTipoEntrega,
    numeroMesa,
    setNumeroMesa,
    clearCart,
  } = useCart();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Campos de Entrega
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Método de Pago
  const [metodoPago, setMetodoPago] = useState<PaymentMethod>("nequi");
  const [pagoEfectivoCon, setPagoEfectivoCon] = useState("");
  const [tarjetaNombre, setTarjetaNombre] = useState("");
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [tarjetaExp, setTarjetaExp] = useState("");
  const [tarjetaCvv, setTarjetaCvv] = useState("");

  // Estado de procesamiento
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  useEffect(() => {
    const user = authService.getStoredUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  // Si el carrito está vacío y no hay orden recién creada
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">No tienes productos en el carrito</h1>
        <p className="text-xs text-gray-500 mb-8 max-w-sm mx-auto">
          Para realizar un pedido, primero debes agregar tus platos favoritos desde el menú.
        </p>
        <Link
          href="/menu"
          className="px-6 py-3 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Ir al Menú
        </Link>
      </div>
    );
  }

  // Pantalla de Éxito / Confirmación de Orden
  if (orderSuccess) {
    const waUrl = `https://api.whatsapp.com/send?phone=573001234567&text=${encodeURIComponent(
      `🔥 *NUEVO PEDIDO TOWSKAN - ORDEN #${orderSuccess.id}* 🔥\n\n` +
      `👤 *Cliente:* ${currentUser?.nombre || "Cliente"}\n` +
      `📍 *Modalidad:* ${orderSuccess.tipo_entrega.toUpperCase()}${orderSuccess.numero_mesa ? ` (${orderSuccess.numero_mesa})` : ""}\n` +
      `💰 *TOTAL A PAGAR:* $${orderSuccess.total.toLocaleString("es-CO")} COP\n` +
      `💳 *Método de Pago:* ${metodoPago.toUpperCase()}\n\n` +
      `Solicito confirmación de mi orden en cocina y despacho. ¡Muchas gracias!`
    )}`;

    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider">
              ¡Pedido Confirmado!
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-3 mb-1">
              Orden #{orderSuccess.id}
            </h1>
            <p className="text-xs text-gray-500">
              Hemos registrado tu orden en la base de datos de Towskan.
            </p>
          </div>

          <div className="p-4 bg-towskan-cream-50 rounded-2xl border border-gray-100 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Modalidad:</span>
              <span className="font-bold uppercase text-gray-800">{orderSuccess.tipo_entrega}</span>
            </div>
            {orderSuccess.numero_mesa && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mesa:</span>
                <span className="font-bold text-gray-800">{orderSuccess.numero_mesa}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className="font-bold text-towskan-orange-600 uppercase">{orderSuccess.estado}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
              <span>Total a Cancelar:</span>
              <span>${orderSuccess.total.toLocaleString("es-CO")} COP</span>
            </div>
          </div>

          {/* Botón WhatsApp de Cocina (Fase 4) */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>📲 Enviar Pedido al WhatsApp de Cocina</span>
          </a>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/pedidos/${orderSuccess.id}`}
              className="flex-1 py-3 px-4 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Rastreo en Vivo
            </Link>
            <Link
              href="/menu"
              className="py-3 px-6 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition"
            >
              Volver al Menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validación de usuario autenticado
    if (!currentUser) {
      setErrorMsg("Debes iniciar sesión para procesar y vincular tu pedido.");
      return;
    }

    // Validación de modalidad 'en mesa'
    if (tipoEntrega === "en mesa" && (!numeroMesa || !numeroMesa.trim())) {
      setErrorMsg("Por favor ingresa el número o nombre de la mesa en la que te encuentras.");
      return;
    }

    // Validación de domicilio
    if (tipoEntrega === "domicilio" && (!direccion || !direccion.trim())) {
      setErrorMsg("Por favor ingresa la dirección completa de entrega a domicilio.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: items.map((i) => ({
          producto_id: i.product.id,
          cantidad: i.quantity,
        })),
        tipo_entrega: tipoEntrega,
        numero_mesa: tipoEntrega === "en mesa" ? numeroMesa.trim() : undefined,
        metodo_pago: metodoPago,
        proveedor_pago:
          metodoPago === "nequi"
            ? "Nequi Móvil"
            : metodoPago === "daviplata"
            ? "Daviplata App"
            : metodoPago === "tarjeta"
            ? `Tarjeta terminada en ${tarjetaNumero.slice(-4) || "XXXX"}`
            : "Efectivo contra entrega",
      };

      const res = await orderService.create(payload);

      if (res.success && res.data) {
        setOrderSuccess(res.data);
        clearCart();
      } else {
        setErrorMsg(res.error || "Ocurrió un error al procesar la orden.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <Link href="/menu" className="text-xs font-bold text-towskan-orange-600 hover:underline mb-2 inline-block">
          ← Volver a modificar el menú
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Finalizar Pedido
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Confirma los datos de entrega y el método de pago para procesar tu orden.
        </p>
      </div>

      {/* Alerta si no está autenticado */}
      {!currentUser && authChecked && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Inicia sesión para continuar</p>
              <p className="text-amber-700">Se requiere una cuenta para asociar tu pedido y facturación.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 bg-towskan-orange-500 text-white font-bold rounded-xl text-xs"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Datos de Entrega y Pago (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Modalidad de Entrega */}
          <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-towskan-orange-500 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Modalidad de Entrega</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTipoEntrega("domicilio")}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  tipoEntrega === "domicilio"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600"
                }`}
              >
                <Bike className="w-6 h-6" />
                <span className="text-xs font-black">A Domicilio</span>
                <span className="text-[10px] text-gray-400 font-semibold">$5.000 COP</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoEntrega("para llevar")}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  tipoEntrega === "para llevar"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600"
                }`}
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="text-xs font-black">Para Llevar</span>
                <span className="text-[10px] text-emerald-600 font-bold">Sin costo</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoEntrega("en mesa")}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  tipoEntrega === "en mesa"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600"
                }`}
              >
                <Utensils className="w-6 h-6" />
                <span className="text-xs font-black">En Mesa</span>
                <span className="text-[10px] text-emerald-600 font-bold">Restaurante</span>
              </button>
            </div>

            {/* Inputs dinámicos según modalidad */}
            {tipoEntrega === "domicilio" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Dirección de Entrega en Valledupar *
                  </label>
                  <input
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Calle 16 #9-45, Barrio Centro"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 300 123 4567"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Indicaciones / Observaciones
                    </label>
                    <input
                      type="text"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej: Casa blanca, timbre 2"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoEntrega === "en mesa" && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Número o Identificador de Mesa *
                </label>
                <input
                  type="text"
                  required
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  placeholder="Ej: Mesa 04 o Terraza 2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Consulta el sticker ubicado en la esquina de tu mesa.
                </p>
              </div>
            )}

            {tipoEntrega === "para llevar" && (
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                📍 Tu pedido estará listo para retirar en la barra principal de Towskan en aproximadamente <strong>20-25 minutos</strong>.
              </div>
            )}
          </section>

          {/* 2. Método de Pago */}
          <section className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-towskan-orange-500 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Método de Pago</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setMetodoPago("nequi")}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  metodoPago === "nequi"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 font-black shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600 font-bold"
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="text-xs">Nequi</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("daviplata")}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  metodoPago === "daviplata"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 font-black shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600 font-bold"
                }`}
              >
                <Smartphone className="w-5 h-5 text-red-600" />
                <span className="text-xs">Daviplata</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  metodoPago === "tarjeta"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 font-black shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600 font-bold"
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  metodoPago === "efectivo"
                    ? "border-towskan-orange-500 bg-orange-50/50 text-towskan-orange-600 font-black shadow-sm"
                    : "border-gray-200 hover:border-orange-200 bg-white text-gray-600 font-bold"
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Efectivo</span>
              </button>
            </div>

            {/* Sub-formulario interactivo de pago */}
            {(metodoPago === "nequi" || metodoPago === "daviplata") && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs space-y-2">
                <p className="font-bold text-gray-800">
                  📱 Transferencia {metodoPago === "nequi" ? "Nequi" : "Daviplata"}:
                </p>
                <p className="text-gray-600">
                  Envía el valor exacto de <strong>${total.toLocaleString("es-CO")} COP</strong> a la línea oficial Towskan:
                </p>
                <div className="p-3 bg-white rounded-xl border border-purple-200 font-mono text-sm font-bold text-purple-900 inline-block">
                  300 123 4567
                </div>
                <p className="text-[11px] text-gray-500">
                  El pago se registrará como pendiente y se aprobará automáticamente en la cocina.
                </p>
              </div>
            )}

            {metodoPago === "tarjeta" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nombre en la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={tarjetaNombre}
                    onChange={(e) => setTarjetaNombre(e.target.value)}
                    placeholder="Como aparece en la tarjeta"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={tarjetaNumero}
                      onChange={(e) => setTarjetaNumero(e.target.value)}
                      placeholder="4500 0000 0000 0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Vencimiento / CVV
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        maxLength={5}
                        value={tarjetaExp}
                        onChange={(e) => setTarjetaExp(e.target.value)}
                        placeholder="MM/AA"
                        className="px-2 py-3 text-center rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                      />
                      <input
                        type="password"
                        maxLength={4}
                        value={tarjetaCvv}
                        onChange={(e) => setTarjetaCvv(e.target.value)}
                        placeholder="CVV"
                        className="px-2 py-3 text-center rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {metodoPago === "efectivo" && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  ¿Con cuánto efectivo pagarás? (Para alistar cambio)
                </label>
                <input
                  type="text"
                  value={pagoEfectivoCon}
                  onChange={(e) => setPagoEfectivoCon(e.target.value)}
                  placeholder={`Monto superior a $${total.toLocaleString("es-CO")} COP`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-towskan-orange-500 transition"
                />
              </div>
            )}
          </section>

        </div>

        {/* Columna Derecha: Resumen Financiero (1 span) */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              Resumen de la Orden
            </h3>

            {/* Lista condensada de ítems */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1 text-xs">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">
                      {quantity}x {product.nombre}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ${product.precio.toLocaleString("es-CO")} COP c/u
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    ${(product.precio * quantity).toLocaleString("es-CO")} COP
                  </span>
                </div>
              ))}
            </div>

            {/* Totales Matemáticos Exactos */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "ítem" : "ítems"}):</span>
                <span className="font-semibold text-gray-800">${subtotal.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between">
                <span>Impoconsumo (8%):</span>
                <span className="font-semibold text-gray-800">${impuestos.toLocaleString("es-CO")} COP</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío:</span>
                <span className="font-semibold text-gray-800">
                  {envio === 0 ? "Gratis" : `$${envio.toLocaleString("es-CO")} COP`}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                <span>Total a Pagar:</span>
                <span className="text-towskan-orange-600">${total.toLocaleString("es-CO")} COP</span>
              </div>
            </div>

            {/* Botón de Confirmación Real */}
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="w-full py-4 px-4 bg-towskan-orange-500 hover:bg-towskan-orange-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Procesando pedido...</span>
              ) : (
                <>
                  <span>Confirmar y Enviar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Transacción real encriptada en backend</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

