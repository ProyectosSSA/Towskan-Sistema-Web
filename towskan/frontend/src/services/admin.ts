import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./api";
import { Order, OrderStatus } from "./orders";

// ─── Tipos ─────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  onRouteOrders: number;
  deliveryCount: number;
  takeawayCount: number;
  dineInCount: number;
  revenueByPaymentMethod: { metodo: string; total: number; count: number }[];
  revenueByDay: { fecha: string; total: number; count: number }[];
}

export interface ProductRankingItem {
  producto_id: number;
  nombre: string;
  categoria: string;
  imagen: string | null;
  unidades: number;
  ingresos: number;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const adminService = {
  /**
   * Obtiene todas las estadísticas globales del negocio.
   */
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      // 1. Todos los pedidos con pagos
      const { data: orders, error: ordersErr } = await supabase
        .from("pedidos")
        .select("id, total, estado, tipo_entrega, fecha_pedido, pagos(metodo, estado)");

      if (ordersErr) return { success: false, error: ordersErr.message };

      const all = orders || [];

      // KPIs básicos
      const nonCancelled = all.filter((o: any) => o.estado !== "cancelado");
      const totalRevenue = nonCancelled.reduce((sum: number, o: any) => sum + Number(o.total), 0);
      const totalOrders = all.length;
      const avgTicket = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0;

      const countByEstado = (estado: string) => all.filter((o: any) => o.estado === estado).length;
      const deliveredOrders = countByEstado("entregado");
      const cancelledOrders = countByEstado("cancelado");
      const pendingOrders = countByEstado("pendiente");
      const preparingOrders = countByEstado("preparando");
      const onRouteOrders = countByEstado("en camino");

      // Conteo por modalidad de entrega
      const deliveryCount = all.filter((o: any) => o.tipo_entrega === "domicilio").length;
      const takeawayCount = all.filter((o: any) => o.tipo_entrega === "para llevar").length;
      const dineInCount = all.filter((o: any) => o.tipo_entrega === "en mesa").length;

      // Ingresos por método de pago (desde la tabla pagos)
      const paymentMap = new Map<string, { total: number; count: number }>();
      for (const o of nonCancelled) {
        const pagos: any[] = (o as any).pagos || [];
        const pago = pagos.find((p: any) => p.estado === "aprobado") || pagos[0];
        if (pago?.metodo) {
          const key = pago.metodo as string;
          const existing = paymentMap.get(key) || { total: 0, count: 0 };
          paymentMap.set(key, {
            total: existing.total + Number((o as any).total),
            count: existing.count + 1,
          });
        }
      }
      const revenueByPaymentMethod = Array.from(paymentMap.entries()).map(([metodo, v]) => ({
        metodo,
        total: v.total,
        count: v.count,
      }));

      // Ingresos por día (últimos 30 días)
      const dayMap = new Map<string, { total: number; count: number }>();
      for (const o of nonCancelled) {
        const dateStr = (o as any).fecha_pedido
          ? new Date((o as any).fecha_pedido).toLocaleDateString("es-CO")
          : "Sin fecha";
        const existing = dayMap.get(dateStr) || { total: 0, count: 0 };
        dayMap.set(dateStr, {
          total: existing.total + Number((o as any).total),
          count: existing.count + 1,
        });
      }
      const revenueByDay = Array.from(dayMap.entries())
        .map(([fecha, v]) => ({ fecha, total: v.total, count: v.count }))
        .slice(-30);

      return {
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          avgTicket,
          deliveredOrders,
          cancelledOrders,
          pendingOrders,
          preparingOrders,
          onRouteOrders,
          deliveryCount,
          takeawayCount,
          dineInCount,
          revenueByPaymentMethod,
          revenueByDay,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Ranking de productos más vendidos.
   */
  async getProductRanking(): Promise<ApiResponse<ProductRankingItem[]>> {
    try {
      // Traer todos los detalles con producto y categoría
      const { data, error } = await supabase
        .from("detalle_pedido")
        .select(`
          producto_id,
          cantidad,
          subtotal,
          pedidos!inner(estado),
          productos (
            nombre,
            imagen,
            categorias (nombre_categoria)
          )
        `);

      if (error) return { success: false, error: error.message };

      // Agrupar por producto_id, excluyendo pedidos cancelados
      const rankMap = new Map<
        number,
        { nombre: string; categoria: string; imagen: string | null; unidades: number; ingresos: number }
      >();

      for (const d of data || []) {
        const item = d as any;
        // Excluir detalle de pedidos cancelados
        if (item.pedidos?.estado === "cancelado") continue;

        const id: number = item.producto_id;
        const nombre: string = item.productos?.nombre || `Producto #${id}`;
        const categoria: string = item.productos?.categorias?.nombre_categoria || "Sin categoría";
        const imagen: string | null = item.productos?.imagen || null;
        const existing = rankMap.get(id) || { nombre, categoria, imagen, unidades: 0, ingresos: 0 };
        rankMap.set(id, {
          ...existing,
          unidades: existing.unidades + Number(item.cantidad),
          ingresos: existing.ingresos + Number(item.subtotal),
        });
      }

      const ranking: ProductRankingItem[] = Array.from(rankMap.entries())
        .map(([producto_id, v]) => ({ producto_id, ...v }))
        .sort((a, b) => b.unidades - a.unidades)
        .slice(0, 20);

      return { success: true, data: ranking };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Todos los pedidos para la tabla de gestión admin.
   */
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          usuario_id,
          subtotal,
          impuestos,
          envio,
          total,
          estado,
          tipo_entrega,
          numero_mesa,
          fecha_pedido,
          usuarios (nombre, email),
          detalle_pedido (
            id,
            producto_id,
            cantidad,
            precio,
            subtotal,
            productos (nombre, imagen)
          ),
          pagos (id, metodo, proveedor, estado, fecha_pago)
        `)
        .order("id", { ascending: false });

      if (error) return { success: false, error: error.message };

      const orders: Order[] = (data || []).map((o: any) => ({
        id: o.id,
        usuario_id: o.usuario_id,
        usuario_nombre: o.usuarios?.nombre || "Cliente",
        usuario_email: o.usuarios?.email || null,
        subtotal: Number(o.subtotal),
        impuestos: Number(o.impuestos),
        envio: Number(o.envio),
        total: Number(o.total),
        estado: o.estado,
        tipo_entrega: o.tipo_entrega,
        numero_mesa: o.numero_mesa,
        fecha_pedido: o.fecha_pedido,
        detalles: (o.detalle_pedido || []).map((d: any) => ({
          id: d.id,
          pedido_id: o.id,
          producto_id: d.producto_id,
          producto_nombre: d.productos?.nombre || `Producto #${d.producto_id}`,
          producto_imagen: d.productos?.imagen || null,
          cantidad: d.cantidad,
          precio: Number(d.precio),
          subtotal: Number(d.subtotal),
        })),
        pagos: (o.pagos || []).map((p: any) => ({
          id: p.id,
          pedido_id: o.id,
          metodo: p.metodo,
          proveedor: p.proveedor,
          estado: p.estado,
          fecha_pago: p.fecha_pago,
        })),
      }));

      return { success: true, data: orders };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Actualiza el estado de un pedido directamente desde el panel admin.
   */
  async updateOrderStatus(id: number, estado: OrderStatus): Promise<ApiResponse<{ id: number; estado: OrderStatus }>> {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ estado })
        .eq("id", id);

      if (error) return { success: false, error: error.message };
      return { success: true, data: { id, estado } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
