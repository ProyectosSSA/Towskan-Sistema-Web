"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { orderService, Order, ReceiptData, OrderStatus } from "@/services/orders";
import {
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  Receipt,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Utensils,
  Bike,
  Printer,
  X,
  Share2,
  SlidersHorizontal,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Fase 4: Modal Comprobante y Simulador Cocina
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [updatingState, setUpdatingState] = useState(false);

  const loadOrder = async (isBackground = false) => {
    if (!orderId || isNaN(orderId)) {
      setErrorMsg("Identificador de pedido inválido.");
      setLoading(false);
      return;
    }

    if (!isBackground) setRefreshing(true);

    try {
      const res = await orderService.getById(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setErrorMsg(res.error || "No se encontró información del pedido solicitado.");
      }
    } catch (err: any) {
      if (!isBackground) {
        setErrorMsg(err.message || "Error al conectar con el servidor.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Actualización reactiva automática en tiempo real (Polling cada 3s mientras esté activo)
  useEffect(() => {
    if (!order || order.estado === "entregado" || order.estado === "cancelado") {
      return;
    }

    const interval = setInterval(() => {
      loadOrder(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.estado, orderId]);

  const handleOpenReceipt = async () => {
    setReceiptModalOpen(true);
    if (!receiptData && orderId) {
      setReceiptLoading(true);
      try {
        const res = await orderService.getReceipt(orderId);
        if (res.success && res.data) {
          setReceiptData(res.data);
        }
      } catch (err) {
        console.error("Error al obtener factura digital:", err);
      } finally {
        setReceiptLoading(false);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }

    setCancelling(true);
    try {
      const res = await orderService.cancel(orderId, "Cancelado por el cliente desde la aplicación");
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        alert(res.error || "No fue posible cancelar el pedido.");
      }
    } catch (err: any) {
      alert(err.message || "Error al cancelar.");
    } finally {
      setCancelling(false);
    }
  };

  // Simulador de cocina para demostraciones ADSO
  const handleSimulateStatus = async (nuevoEstado: OrderStatus) => {
    setUpdatingState(true);
    try {
      const res = await orderService.updateStatus(orderId, nuevoEstado);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        alert(res.error || "Error al actualizar estado.");
      }
    } catch (err: any) {
      alert(err.message || "Error al actualizar estado.");
    } finally {
      setUpdatingState(false);
    }
  };

  const steps = [
    { key: "pendiente", label: "Recibido", icon: Clock, desc: "Orden registrada" },
    { key: "preparando", label: "En Cocina", icon: ChefHat, desc: "Parrilla y ensamble" },
    { key: "en camino", label: "En Camino", icon: Truck, desc: "Ruta de reparto" },
    { key: "entregado", label: "Entregado", icon: CheckCircle2, desc: "¡Buen provecho!" },
  ];

  const getStepIndex = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return 0;
      case "preparando":
        return 1;
      case "en camino":
        return 2;
      case "entregado":
        return 3;
      default:
        return -1;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 border-4 border-towskan-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500">Cargando estado en tiempo real de la orden #{orderId}...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar pedido</h2>
        <p className="text-xs text-gray-500 mb-6">{errorMsg || "El pedido no fue encontrado."}</p>
        <Link
          href="/pedidos"
          className="px-6 py-2.5 bg-towskan-orange-500 text-white font-bold text-xs rounded-xl"
        >
          Volver a Mis Pedidos
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.estado);
  const isCancelled = order.estado === "cancelado";

  // URL WhatsApp
  const waUrl = `https://api.whatsapp.com/send?phone=573001234567&text=${encodeURIComponent(
    `🔥 *CONSULTA PEDIDO TOWSKAN - ORDEN #${order.id}* 🔥\n\n` +
    `👤 *Cliente:* ${order.usuario_nombre || "Cliente"}\n` +
    `📍 *Modalidad:* ${order.tipo_entrega.toUpperCase()}${order.numero_mesa ? ` (${order.numero_mesa})` : ""}\n` +
    `💰 *Total:* $${order.total.toLocaleString("es-CO")} COP\n` +
    `📌 *Estado Actual:* ${order.estado.toUpperCase()}\n\n` +
    `Deseo consultar el tiempo estimado de entrega de mi orden.`
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Barra de cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/pedidos"
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-towskan-orange-500">
                Seguimiento en Vivo
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sincronización en vivo activa" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Orden #{order.id}
            </h1>
          </div>
        </div>

        {/* Acciones de Fase 4 */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Cocina</span>
          </a>

          <button
            onClick={handleOpenReceipt}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5 text-towskan-orange-500" />
            <span>Ver Factura</span>
          </button>

          <button
            onClick={() => loadOrder(false)}
            disabled={refreshing}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition shadow-sm"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Toggle de Simulador Cocina (ADSO) */}
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition flex items-center gap-1"
            title="Panel de Demostración ADSO"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulador</span>
          </button>
        </div>
      </div>

      {/* Panel Simulador de Cocina (Solo para evaluación y demo ADSO) */}
      {simulatorOpen && (
        <div className="p-4 bg-orange-50/80 border border-towskan-orange-200 rounded-2xl text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-black text-towskan-orange-700 uppercase tracking-wider text-[11px]">
              🛠️ Panel de Demostración ADSO (Control de Cocina / Despacho)
            </span>
            <span className="text-[10px] text-gray-500">Permite simular el avance de la orden en tiempo real</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={updatingState || order.estado === "preparando"}
              onClick={() => handleSimulateStatus("preparando")}
              className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-40"
            >
              1. Enviar a Cocina (preparando)
            </button>
            <button
              disabled={updatingState || order.estado === "en camino"}
              onClick={() => handleSimulateStatus("en camino")}
              className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-40"
            >
              2. Despachar a Domicilio (en camino)
            </button>
            <button
              disabled={updatingState || order.estado === "entregado"}
              onClick={() => handleSimulateStatus("entregado")}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-40"
            >
              3. Marcar Entregado (entregado)
            </button>
          </div>
        </div>
      )}

      {/* Stepper de Progreso */}
      <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
        {isCancelled ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
            <XCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-900">Este pedido fue cancelado</h3>
            <p className="text-xs text-red-600">
              La orden ha sido anulada en el sistema. Si requieres asistencia contáctanos por WhatsApp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isPast = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div key={st.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                      isPast
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : isCurrent
                        ? "bg-towskan-orange-500 text-white ring-4 ring-orange-100 shadow-md shadow-orange-500/20 animate-pulse"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-black ${
                        isCurrent
                          ? "text-towskan-orange-600"
                          : isPast
                          ? "text-emerald-700"
                          : "text-gray-400"
                      }`}
                    >
                      {st.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Detalle de Productos (2 cols) */}
        <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">
              Platos y Bebidas Solicitados
            </h3>
            <span className="text-xs text-gray-400">
              {order.detalles?.length || 0} referencias
            </span>
          </div>

          <div className="space-y-3">
            {order.detalles?.map((det) => (
              <div
                key={det.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍔</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {det.producto_nombre || `Producto #${det.producto_id}`}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {det.cantidad} {det.cantidad === 1 ? "unidad" : "unidades"} a ${det.precio.toLocaleString("es-CO")} COP
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900">
                  ${det.subtotal.toLocaleString("es-CO")} COP
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-800">${order.subtotal.toLocaleString("es-CO")} COP</span>
            </div>
            <div className="flex justify-between">
              <span>Impuesto Nacional al Consumo (8%):</span>
              <span className="font-semibold text-gray-800">${order.impuestos.toLocaleString("es-CO")} COP</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de Envío:</span>
              <span className="font-semibold text-gray-800">
                {order.envio === 0 ? "Gratis" : `$${order.envio.toLocaleString("es-CO")} COP`}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
              <span>Total Cancelado:</span>
              <span className="text-towskan-orange-600">${order.total.toLocaleString("es-CO")} COP</span>
            </div>
          </div>

          {/* Botón de Cancelación (Fase 4: Solo disponible si estado es 'pendiente') */}
          {order.estado === "pendiente" && (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                ¿Deseas cancelar antes de entrar a cocina?
              </span>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition"
              >
                {cancelling ? "Cancelando..." : "Cancelar Pedido"}
              </button>
            </div>
          )}
        </div>

        {/* Información Operativa y Pagos (1 col) */}
        <div className="space-y-6">
          {/* Tarjeta Modalidad */}
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 text-xs">
            <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
              Modalidad de Consumo
            </h4>
            <div className="flex items-center gap-2 font-bold text-towskan-orange-600 capitalize text-sm">
              {order.tipo_entrega === "domicilio" ? (
                <Bike className="w-5 h-5" />
              ) : order.tipo_entrega === "en mesa" ? (
                <Utensils className="w-5 h-5" />
              ) : (
                <Receipt className="w-5 h-5" />
              )}
              <span>{order.tipo_entrega}</span>
            </div>
            {order.numero_mesa && (
              <p className="text-gray-700 font-semibold bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                Ubicación: <strong>{order.numero_mesa}</strong>
              </p>
            )}
            <p className="text-[11px] text-gray-400">
              Fecha: {order.fecha_pedido ? new Date(order.fecha_pedido).toLocaleString("es-CO") : "N/A"}
            </p>
          </div>

          {/* Tarjeta Pagos */}
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 text-xs">
            <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-towskan-orange-500" />
              <span>Transacciones de Pago</span>
            </h4>

            {order.pagos && order.pagos.length > 0 ? (
              order.pagos.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="capitalize">{p.metodo}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black ${
                        p.estado === "aprobado"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.estado === "rechazado"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </div>
                  {p.proveedor && <p className="text-[11px] text-gray-400">{p.proveedor}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs">Sin transacciones registradas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Factura / Comprobante Digital (Fase 4) */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-towskan-orange-500 text-white flex justify-between items-center">
              <span className="font-black text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span>Factura / Comprobante Digital</span>
              </span>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4 text-xs font-mono text-gray-700">
              {receiptLoading ? (
                <div className="py-12 text-center text-gray-400">Generando comprobante fiscal...</div>
              ) : receiptData ? (
                <div id="print-receipt" className="space-y-4">
                  <div className="text-center space-y-1 border-b border-dashed border-gray-300 pb-3">
                    <h2 className="text-sm font-black text-gray-900">{receiptData.establecimiento.nombre}</h2>
                    <p>NIT: {receiptData.establecimiento.nit}</p>
                    <p>{receiptData.establecimiento.direccion}</p>
                    <p>{receiptData.establecimiento.ciudad}</p>
                    <p>Tel: {receiptData.establecimiento.telefono}</p>
                    <p className="text-[10px] text-gray-500">{receiptData.establecimiento.regimen}</p>
                  </div>

                  <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                    <div>
                      <p><strong>Factura:</strong> {receiptData.factura.numero_factura}</p>
                      <p><strong>Fecha:</strong> {receiptData.factura.fecha_formateada}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Cliente:</strong> {receiptData.factura.cliente.nombre}</p>
                      <p><strong>Modalidad:</strong> {receiptData.factura.servicio.tipo_entrega.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-3">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Cant • Descripción</span>
                      <span>Total</span>
                    </div>
                    {receiptData.factura.items.map((it, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{it.cantidad}x {it.descripcion}</span>
                        <span>${it.subtotal.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 border-b border-dashed border-gray-300 pb-3">
                    <div className="flex justify-between">
                      <span>Subtotal Gravado:</span>
                      <span>${receiptData.factura.totales.subtotal.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impoconsumo (8%):</span>
                      <span>${receiptData.factura.totales.impoconsumo_8.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo de Envío:</span>
                      <span>${receiptData.factura.totales.envio.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-gray-900 pt-1">
                      <span>TOTAL A PAGAR:</span>
                      <span>${receiptData.factura.totales.total.toLocaleString("es-CO")} COP</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-gray-400 pt-1">
                    Sistema Web Interactivo Towskan • SENA CBC Regional Cesar (2026)
                  </div>
                </div>
              ) : (
                <p>No se pudo cargar la factura.</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Factura</span>
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
