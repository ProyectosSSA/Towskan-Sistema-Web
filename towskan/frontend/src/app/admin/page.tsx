"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { authService } from "@/services/auth";
import { adminService, AdminStats, ProductRankingItem } from "@/services/admin";
import { Order, OrderStatus } from "@/services/orders";
import { resolveProductImage, getProductEmoji } from "@/lib/productAssets";
import {
  BarChart2,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Bike,
  Utensils,
  RefreshCw,
  Shield,
  ChevronRight,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  Star,
  Filter,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cop(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CO") + " COP";
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: <Clock className="w-3 h-3" />,
  },
  preparando: {
    label: "Preparando",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: <Utensils className="w-3 h-3" />,
  },
  "en camino": {
    label: "En Camino",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: <Bike className="w-3 h-3" />,
  },
  entregado: {
    label: "Entregado",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelado: {
    label: "Cancelado",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const statusFlow: OrderStatus[] = ["pendiente", "preparando", "en camino", "entregado", "cancelado"];

function StatusBadge({ estado }: { estado: OrderStatus }) {
  const cfg = statusConfig[estado] || statusConfig["pendiente"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function PaymentIcon({ metodo }: { metodo: string }) {
  const m = metodo?.toLowerCase();
  if (m === "nequi" || m === "daviplata") return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
  if (m === "tarjeta") return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
  return <Banknote className="w-3.5 h-3.5 text-green-600" />;
}

function DeliveryIcon({ tipo }: { tipo: string }) {
  if (tipo === "domicilio") return <Bike className="w-3.5 h-3.5 text-towskan-orange-500" />;
  if (tipo === "en mesa") return <Utensils className="w-3.5 h-3.5 text-blue-500" />;
  return <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  icon,
  label,
  value,
  sub,
  color = "orange",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: "orange" | "green" | "blue" | "red" | "purple" | "gray";
}) {
  const palette = {
    orange: "bg-towskan-orange-50 text-towskan-orange-500",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition">
      <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${palette[color]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-lg sm:text-xl font-black text-gray-900 mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Barra de progreso simple ─────────────────────────────────────────────────

function BarRow({ label, value, max, color = "#f97316" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-16 text-right shrink-0">{cop(value)}</span>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

type TabFilter = "todos" | OrderStatus;

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ranking, setRanking] = useState<ProductRankingItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<TabFilter>("todos");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guard de autenticación admin
  useEffect(() => {
    const user = authService.getStoredUser();
    if (!user || user.email !== "admin@towskan.com") {
      window.location.href = "/login";
      return;
    }
    setAuthorized(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, rankingRes, ordersRes] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getProductRanking(),
        adminService.getAllOrders(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      else setError(statsRes.error || "Error cargando estadísticas");

      if (rankingRes.success && rankingRes.data) setRanking(rankingRes.data);
      if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) loadData();
  }, [authorized, loadData]);

  const handleStatusChange = async (orderId: number, newEstado: OrderStatus) => {
    setUpdatingId(orderId);
    const res = await adminService.updateOrderStatus(orderId, newEstado);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: newEstado } : o))
      );
    }
    setUpdatingId(null);
  };

  if (!authorized) return null;

  const filteredOrders =
    tab === "todos" ? orders : orders.filter((o) => o.estado === tab);

  const maxPaymentRevenue = Math.max(...(stats?.revenueByPaymentMethod || []).map((r) => r.total), 1);
  const maxProductRevenue = Math.max(...ranking.map((r) => r.ingresos), 1);

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header admin */}
      <div className="bg-gradient-to-r from-towskan-dark-900 via-towskan-dark-800 to-towskan-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 sm:w-12 sm:h-12 bg-towskan-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Panel de Administración</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">🔥 Towskan Gourmet Express · Valledupar</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold transition disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-24" />
            ))}
          </div>
        )}

        {/* KPIs */}
        {!loading && stats && (
          <>
            <section>
              <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-towskan-orange-500" />
                Resumen General
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <KPICard
                  icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Ingresos Totales"
                  value={cop(stats.totalRevenue)}
                  sub="Pedidos no cancelados"
                  color="orange"
                />
                <KPICard
                  icon={<ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Total Pedidos"
                  value={stats.totalOrders.toString()}
                  sub={`${stats.deliveredOrders} entregados`}
                  color="blue"
                />
                <KPICard
                  icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Ticket Promedio"
                  value={cop(stats.avgTicket)}
                  sub="Por pedido activo"
                  color="green"
                />
                <KPICard
                  icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Pendientes"
                  value={stats.pendingOrders.toString()}
                  sub={`${stats.preparingOrders} en cocina`}
                  color="purple"
                />
                <KPICard
                  icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Entregados"
                  value={stats.deliveredOrders.toString()}
                  color="green"
                />
                <KPICard
                  icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Cancelados"
                  value={stats.cancelledOrders.toString()}
                  color="red"
                />
                <KPICard
                  icon={<Bike className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Domicilios"
                  value={stats.deliveryCount.toString()}
                  color="orange"
                />
                <KPICard
                  icon={<Utensils className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="En Mesa"
                  value={stats.dineInCount.toString()}
                  sub={`${stats.takeawayCount} para llevar`}
                  color="gray"
                />
              </div>
            </section>

            {/* Ingresos por método de pago + Modalidad */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Método de pago */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm sm:text-base font-black text-gray-900 mb-5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-towskan-orange-500" />
                  Ingresos por Método de Pago
                </h3>
                {stats.revenueByPaymentMethod.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin datos de pagos aún</p>
                ) : (
                  <div className="space-y-3">
                    {stats.revenueByPaymentMethod
                      .sort((a, b) => b.total - a.total)
                      .map((r) => (
                        <div key={r.metodo}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 capitalize">
                              <PaymentIcon metodo={r.metodo} />
                              {r.metodo}
                            </span>
                            <span className="text-[11px] text-gray-400">{r.count} pedidos</span>
                          </div>
                          <BarRow
                            label=""
                            value={r.total}
                            max={maxPaymentRevenue}
                            color="#f97316"
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Modalidades de entrega */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm sm:text-base font-black text-gray-900 mb-5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-towskan-orange-500" />
                  Distribución por Modalidad
                </h3>
                {stats.totalOrders === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin pedidos aún</p>
                ) : (
                  <div className="space-y-4">
                    {[
                      {
                        label: "Domicilio",
                        count: stats.deliveryCount,
                        icon: <Bike className="w-4 h-4 text-towskan-orange-500" />,
                        color: "#f97316",
                      },
                      {
                        label: "En Mesa",
                        count: stats.dineInCount,
                        icon: <Utensils className="w-4 h-4 text-blue-500" />,
                        color: "#3b82f6",
                      },
                      {
                        label: "Para Llevar",
                        count: stats.takeawayCount,
                        icon: <ShoppingBag className="w-4 h-4 text-gray-500" />,
                        color: "#6b7280",
                      },
                    ].map((m) => {
                      const pct = stats.totalOrders > 0 ? Math.round((m.count / stats.totalOrders) * 100) : 0;
                      return (
                        <div key={m.label} className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                            {m.icon}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-gray-700">{m.label}</span>
                              <span className="text-xs text-gray-400">{m.count} pedidos · {pct}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, backgroundColor: m.color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Estados de pedidos */}
            <section>
              <h3 className="text-sm sm:text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-towskan-orange-500" />
                Distribución por Estado
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(
                  [
                    { estado: "pendiente" as OrderStatus, count: stats.pendingOrders },
                    { estado: "preparando" as OrderStatus, count: stats.preparingOrders },
                    { estado: "en camino" as OrderStatus, count: stats.onRouteOrders },
                    { estado: "entregado" as OrderStatus, count: stats.deliveredOrders },
                    { estado: "cancelado" as OrderStatus, count: stats.cancelledOrders },
                  ] as { estado: OrderStatus; count: number }[]
                ).map(({ estado, count }) => {
                  const cfg = statusConfig[estado];
                  const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                  return (
                    <button
                      key={estado}
                      onClick={() => setTab(estado)}
                      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition group ${
                        tab === estado ? "ring-2 ring-towskan-orange-400" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color} mb-2`}>
                        {cfg.icon}{cfg.label}
                      </span>
                      <p className="text-2xl font-black text-gray-900">{count}</p>
                      <p className="text-[11px] text-gray-400">{pct}% del total</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Ranking de productos */}
        {!loading && ranking.length > 0 && (
          <section>
            <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-towskan-orange-500" />
              Top Productos Más Vendidos
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-black text-gray-500 px-5 py-3.5">#</th>
                      <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Producto</th>
                      <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Categoría</th>
                      <th className="text-right text-xs font-black text-gray-500 px-4 py-3.5">Unidades</th>
                      <th className="text-right text-xs font-black text-gray-500 px-5 py-3.5">Ingresos</th>
                      <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Popularidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ranking.slice(0, 10).map((item, idx) => (
                      <tr key={item.producto_id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                              idx === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : idx === 1
                                ? "bg-gray-200 text-gray-600"
                                : idx === 2
                                ? "bg-orange-100 text-orange-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-lg">
                              {item.imagen ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={resolveProductImage(item.imagen ?? undefined) ?? ""}
                                  alt={item.nombre}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                getProductEmoji(item.nombre)
                              )}
                            </div>
                            <span className="font-bold text-gray-900 text-xs">{item.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{item.categoria}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-black text-gray-900">{item.unidades}</span>
                          <span className="text-xs text-gray-400 ml-1">und.</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-xs font-black text-emerald-700">{cop(item.ingresos)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 w-28">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-towskan-orange-400 rounded-full"
                                style={{
                                  width: `${(item.ingresos / maxProductRevenue) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 w-7 text-right">
                              {Math.round((item.ingresos / maxProductRevenue) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {ranking.slice(0, 10).map((item, idx) => (
                  <div key={item.producto_id} className="p-4 flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-lg">
                      {item.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveProductImage(item.imagen ?? undefined) ?? ""}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        getProductEmoji(item.nombre)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{item.nombre}</p>
                      <p className="text-[10px] text-gray-400">{item.categoria}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-gray-900">{item.unidades} und.</p>
                      <p className="text-[10px] font-bold text-emerald-600">{cop(item.ingresos)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabla de pedidos */}
        {!loading && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-towskan-orange-500" />
                Gestión de Pedidos
                <span className="text-sm font-bold text-gray-400">({filteredOrders.length})</span>
              </h2>
              {/* Filtro por estado */}
              <div className="flex flex-wrap gap-1.5">
                {(["todos", "pendiente", "preparando", "en camino", "entregado", "cancelado"] as TabFilter[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        tab === t
                          ? "bg-towskan-orange-500 text-white shadow-sm shadow-orange-500/30"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t === "todos" ? "Todos" : statusConfig[t as OrderStatus]?.label || t}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No hay pedidos en este estado</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left text-xs font-black text-gray-500 px-5 py-3.5">#</th>
                        <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Cliente</th>
                        <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Modalidad</th>
                        <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Pago</th>
                        <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Estado</th>
                        <th className="text-right text-xs font-black text-gray-500 px-4 py-3.5">Total</th>
                        <th className="text-left text-xs font-black text-gray-500 px-4 py-3.5">Fecha</th>
                        <th className="text-left text-xs font-black text-gray-500 px-5 py-3.5">Cambiar Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map((order) => {
                        const pago = order.pagos?.[0];
                        return (
                          <tr key={order.id} className="hover:bg-gray-50/60 transition">
                            <td className="px-5 py-3.5">
                              <Link
                                href={`/pedidos/${order.id}`}
                                className="inline-flex items-center gap-1 text-xs font-black text-towskan-orange-600 hover:underline"
                              >
                                #{order.id}
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xs font-bold text-gray-900 max-w-[130px] truncate">
                                {order.usuario_nombre || "Cliente"}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[130px]">
                                {order.usuario_email || "—"}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                <DeliveryIcon tipo={order.tipo_entrega} />
                                <span className="capitalize">{order.tipo_entrega}</span>
                                {order.numero_mesa && (
                                  <span className="text-gray-400">· Mesa {order.numero_mesa}</span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {pago ? (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 capitalize">
                                  <PaymentIcon metodo={pago.metodo} />
                                  {pago.metodo}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <StatusBadge estado={order.estado} />
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <span className="text-xs font-black text-gray-900">{cop(order.total)}</span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">
                              {formatDate(order.fecha_pedido)}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {statusFlow
                                  .filter((s) => s !== order.estado)
                                  .map((s) => {
                                    const cfg = statusConfig[s];
                                    return (
                                      <button
                                        key={s}
                                        onClick={() => handleStatusChange(order.id, s)}
                                        disabled={updatingId === order.id}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition disabled:opacity-40 ${cfg.bg} ${cfg.color} border-transparent hover:opacity-80`}
                                      >
                                        {updatingId === order.id ? (
                                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                        ) : (
                                          cfg.icon
                                        )}
                                        {cfg.label}
                                      </button>
                                    );
                                  })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / tablet cards */}
                <div className="lg:hidden divide-y divide-gray-50">
                  {filteredOrders.map((order) => {
                    const pago = order.pagos?.[0];
                    return (
                      <div key={order.id} className="p-4 space-y-3">
                        {/* Row 1: ID + estado + total */}
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/pedidos/${order.id}`}
                            className="inline-flex items-center gap-1 text-sm font-black text-towskan-orange-600 hover:underline"
                          >
                            Pedido #{order.id}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <div className="flex items-center gap-2">
                            <StatusBadge estado={order.estado} />
                            <span className="text-sm font-black text-gray-900">{cop(order.total)}</span>
                          </div>
                        </div>
                        {/* Row 2: cliente + fecha */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {order.usuario_nombre || "Cliente"}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">{order.usuario_email || "—"}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 text-right shrink-0">
                            {formatDate(order.fecha_pedido)}
                          </p>
                        </div>
                        {/* Row 3: modalidad + pago */}
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                            <DeliveryIcon tipo={order.tipo_entrega} />
                            <span className="capitalize">{order.tipo_entrega}</span>
                            {order.numero_mesa && <span>· Mesa {order.numero_mesa}</span>}
                          </span>
                          {pago && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 capitalize">
                              <PaymentIcon metodo={pago.metodo} />
                              {pago.metodo}
                            </span>
                          )}
                        </div>
                        {/* Cambiar estado */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {statusFlow
                            .filter((s) => s !== order.estado)
                            .map((s) => {
                              const cfg = statusConfig[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(order.id, s)}
                                  disabled={updatingId === order.id}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition disabled:opacity-40 ${cfg.bg} ${cfg.color} hover:opacity-80`}
                                >
                                  {updatingId === order.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    cfg.icon
                                  )}
                                  → {cfg.label}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Footer admin */}
        {!loading && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">
              🔥 Towskan Gourmet Express · Panel Admin · Valledupar, Cesar · Colombia
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Acceso restringido — solo administradores
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
