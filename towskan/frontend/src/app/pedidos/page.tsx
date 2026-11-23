"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService, Order, OrderStatus } from "@/services/orders";
import { authService, User } from "@/services/auth";
import {
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  Receipt,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const user = authService.getStoredUser();
    setCurrentUser(user);
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const resolveProductImage = (img?: string | null, name?: string | null) => {
    if (img && img.trim()) return img;
    if (!name) return null;
    const n = name.toLowerCase();
    if (n.includes("clasica") || n.includes("master")) return "/images/menu/towskan-clasica.jpg";
    if (n.includes("doble queso") || n.includes("bacon")) return "/images/menu/doble-queso-bacon.jpg";
    if (n.includes("smoked") || n.includes("bbq")) return "/images/menu/smoked-bbq.jpg";
    if (n.includes("chicken") || n.includes("volcano")) return "/images/menu/chicken-crispy.jpg";
    if (n.includes("papas rusticas") || n.includes("rústicas") || n.includes("papas")) return "/images/menu/papas-rusticas.jpg";
    if (n.includes("salchipapa")) return "/images/menu/salchipapas.jpg";
    if (n.includes("aros")) return "/images/menu/aros-cebolla.jpg";
    if (n.includes("oreo")) return "/images/menu/malteada-oreo.jpg";
    if (n.includes("arequipe")) return "/images/menu/malteada-arequipe.jpg";
    if (n.includes("limonada") || n.includes("coco")) return "/images/menu/limonada-coco.jpg";
    if (n.includes("gaseosa") || n.includes("coca")) return "/images/menu/gaseosa.jpg";
    if (n.includes("salsa towskan") || n.includes("secreta")) return "/images/menu/salsa-towskan.jpg";
    if (n.includes("cheddar")) return "/images/menu/cheddar-dip.jpg";
    return null;
  };

  const getProductEmoji = (nombre: string) => {
    const lower = nombre.toLowerCase();
    if (lower.includes("hamburguesa") || lower.includes("angus") || lower.includes("bacon") || lower.includes("bbq") || lower.includes("chicken")) return "🍔";
    if (lower.includes("acompañamiento") || lower.includes("papa") || lower.includes("salchipapa") || lower.includes("aros")) return "🍟";
    if (lower.includes("bebida") || lower.includes("malteada") || lower.includes("limonada") || lower.includes("gaseosa")) return "🥤";
    if (lower.includes("salsa") || lower.includes("dip") || lower.includes("cheddar")) return "🥫";
    return "🍽️";
  };

  const getStatusBadge = (estado: OrderStatus) => {
    switch (estado) {
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
      case "preparando":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ChefHat className="w-3.5 h-3.5 animate-bounce" />
            <span>En Cocina</span>
          </span>
        );
      case "en camino":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5" />
            <span>En Camino</span>
          </span>
        );
      case "entregado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Entregado</span>
          </span>
        );
      case "cancelado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelado</span>
          </span>
        );
    }
  };

  if (!currentUser && !loading) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Inicia Sesión</h1>
        <p className="text-xs text-gray-500 mb-8 leading-relaxed">
          Para consultar tu historial de compras y hacer seguimiento en vivo a tus pedidos, accede a tu cuenta.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl transition"
          >
            Registrarse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-towskan-orange-500">
            Historial de Compras
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
            Mis Pedidos
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Consulta el estado en cocina y reparto de tus órdenes en Towskan.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Actualizar Estados</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-gray-100 p-6 animate-pulse space-y-4" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-towskan-orange-50 text-towskan-orange-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Aún no has realizado pedidos</h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Explora nuestro menú gourmet y realiza tu primera orden de hamburguesas Angus.
          </p>
          <Link
            href="/menu"
            className="px-6 py-3 bg-towskan-orange-500 hover:bg-towskan-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Ver Menú
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = order.fecha_pedido
              ? new Date(order.fecha_pedido).toLocaleString("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Fecha no disponible";

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Cabecera de la tarjeta de orden */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-towskan-orange-50 text-towskan-orange-600 flex items-center justify-center font-black text-sm">
                      #{order.id}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900">
                        Orden #{order.id} • {order.tipo_entrega.toUpperCase()}
                      </h3>
                      <p className="text-[11px] text-gray-400">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.estado)}
                    <Link
                      href={`/pedidos/${order.id}`}
                      className="p-2 text-towskan-orange-600 hover:bg-orange-50 rounded-xl transition text-xs font-bold flex items-center gap-1"
                    >
                      <span>Rastreo</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Lista de productos pedidos */}
                <div className="space-y-2.5 text-xs">
                  {order.detalles?.map((det) => (
                    <div key={det.id} className="flex justify-between items-center text-gray-700">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-towskan-cream-50 flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-100">
                          {resolveProductImage(det.producto_imagen, det.producto_nombre) ? (
                            <img
                              src={resolveProductImage(det.producto_imagen, det.producto_nombre)!}
                              alt={det.producto_nombre || "Plato"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className="text-sm flex items-center justify-center w-full h-full"
                            style={{
                              display: resolveProductImage(det.producto_imagen, det.producto_nombre) ? "none" : "flex",
                            }}
                          >
                            {getProductEmoji(det.producto_nombre || "")}
                          </span>
                        </div>
                        <span className="font-medium truncate">
                          <strong>{det.cantidad}x</strong> {det.producto_nombre || `Producto #${det.producto_id}`}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 shrink-0">
                        ${det.subtotal.toLocaleString("es-CO")} COP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Resumen de totales */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>Subtotal: ${order.subtotal.toLocaleString("es-CO")}</span>
                    <span>Impuesto 8%: ${order.impuestos.toLocaleString("es-CO")}</span>
                    <span>Envío: {order.envio === 0 ? "Gratis" : `$${order.envio.toLocaleString("es-CO")}`}</span>
                    {order.numero_mesa && (
                      <span className="font-bold text-gray-800">Mesa: {order.numero_mesa}</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total</span>
                    <span className="text-base font-black text-towskan-orange-600">
                      ${order.total.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

