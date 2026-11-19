import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./api";
import { authService } from "./auth";

export type OrderStatus = "pendiente" | "preparando" | "en camino" | "entregado" | "cancelado";
export type DeliveryType = "domicilio" | "para llevar" | "en mesa";
export type PaymentMethod = "efectivo" | "nequi" | "daviplata" | "tarjeta";
export type PaymentStatus = "pendiente" | "aprobado" | "rechazado";

export interface OrderDetail {
  id: number;
  pedido_id: number;
  producto_id: number;
  producto_nombre?: string | null;
  producto_imagen?: string | null;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  pedido_id: number;
  metodo: PaymentMethod;
  proveedor?: string | null;
  estado: PaymentStatus;
  fecha_pago?: string | null;
}

export interface Order {
  id: number;
  usuario_id: number;
  usuario_nombre?: string | null;
  usuario_email?: string | null;
  subtotal: number;
  impuestos: number;
  envio: number;
  total: number;
  estado: OrderStatus;
  tipo_entrega: DeliveryType;
  numero_mesa?: string | null;
  fecha_pedido?: string | null;
  detalles?: OrderDetail[];
  pagos?: Payment[];
}

export interface CreateOrderPayload {
  items: { producto_id: number; cantidad: number }[];
  tipo_entrega: DeliveryType;
  numero_mesa?: string;
  metodo_pago?: PaymentMethod;
  proveedor_pago?: string;
}

export interface QuotePayload {
  items: { producto_id: number; cantidad: number }[];
  tipo_entrega: DeliveryType;
}

export interface QuoteResult {
  subtotal: number;
  impuestos: number;
  envio: number;
  total: number;
  tipo_entrega: DeliveryType;
}

export interface WhatsAppData {
  order_id: number;
  whatsapp_phone: string;
  raw_message: string;
  whatsapp_url: string;
}

export interface ReceiptData {
  establecimiento: {
    nombre: string;
    nit: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    regimen: string;
  };
  factura: {
    numero_factura: string;
    fecha_emision: string;
    fecha_formateada: string;
    cliente: {
      id?: number;
      nombre: string;
      email: string;
    };
    servicio: {
      tipo_entrega: DeliveryType;
      numero_mesa?: string | null;
      estado: OrderStatus;
    };
    items: {
      cantidad: number;
      descripcion: string;
      precio_unitario: number;
      subtotal: number;
    }[];
    totales: {
      subtotal: number;
      impoconsumo_8: number;
      envio: number;
      total: number;
    };
    pagos: {
      id: number;
      metodo: string;
      proveedor?: string | null;
      estado: string;
      fecha?: string | null;
    }[];
  };
}

export interface OrderStatusData {
  id: number;
  estado: OrderStatus;
  tipo_entrega: DeliveryType;
  numero_mesa?: string | null;
  total: number;
}

export const orderService = {
  async quote(payload: QuotePayload): Promise<ApiResponse<QuoteResult>> {
    try {
      const productIds = payload.items.map((i) => i.producto_id);
      const { data: prods, error } = await supabase
        .from("productos")
        .select("id, precio")
        .in("id", productIds);

      if (error) return { success: false, error: error.message };

      const priceMap = new Map((prods || []).map((p: any) => [p.id, Number(p.precio)]));

      let subtotal = 0;
      for (const item of payload.items) {
        const precio = priceMap.get(item.producto_id) || 0;
        subtotal += precio * item.cantidad;
      }

      // Reglas Financieras Oficiales Towskan: 8% INC + Envío $5.000 COP
      const impuestos = Math.round(subtotal * 0.08 * 100) / 100;
      const envio = payload.tipo_entrega === "domicilio" ? 5000 : 0;
      const total = subtotal + impuestos + envio;

      return {
        success: true,
        data: {
          subtotal,
          impuestos,
          envio,
          total,
          tipo_entrega: payload.tipo_entrega,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async create(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    try {
      // 1. Validaciones de Negocio
      if (!payload.items || payload.items.length === 0) {
        return { success: false, error: "El pedido debe contener al menos un producto." };
      }
      if (payload.tipo_entrega === "en mesa" && !payload.numero_mesa?.trim()) {
        return { success: false, error: "Debe ingresar el número de mesa para consumo en restaurante." };
      }

      // 2. Obtener precios actualizados
      const productIds = payload.items.map((i) => i.producto_id);
      const { data: prods, error: prodErr } = await supabase
        .from("productos")
        .select("id, nombre, precio, disponible")
        .in("id", productIds);

      if (prodErr) return { success: false, error: prodErr.message };

      const prodMap = new Map((prods || []).map((p: any) => [p.id, p]));

      let subtotal = 0;
      const detailsToInsert: any[] = [];

      for (const item of payload.items) {
        const prod = prodMap.get(item.producto_id);
        if (!prod) {
          return { success: false, error: `El producto ID ${item.producto_id} no existe.` };
        }
        if (!prod.disponible) {
          return { success: false, error: `El producto '${prod.nombre}' se encuentra agotado temporalmente.` };
        }
        const itemPrecio = Number(prod.precio);
        const itemSubtotal = itemPrecio * item.cantidad;
        subtotal += itemSubtotal;
        detailsToInsert.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio: itemPrecio,
          subtotal: itemSubtotal,
        });
      }

      // 3. Monto Mínimo para Domicilios
      if (payload.tipo_entrega === "domicilio" && subtotal < 15000) {
        return {
          success: false,
          error: "El monto mínimo de compra para despachos a domicilio es de $15.000 COP.",
        };
      }

      const impuestos = Math.round(subtotal * 0.08 * 100) / 100;
      const envio = payload.tipo_entrega === "domicilio" ? 5000 : 0;
      const total = subtotal + impuestos + envio;

      // 4. Usuario activo
      const user = authService.getStoredUser();
      const usuario_id = user?.id || 2;

      // 5. Insertar Cabecera de Pedido en Supabase
      const { data: orderData, error: orderErr } = await supabase
        .from("pedidos")
        .insert([
          {
            usuario_id,
            subtotal,
            impuestos,
            envio,
            total,
            estado: "pendiente",
            tipo_entrega: payload.tipo_entrega,
            numero_mesa: payload.tipo_entrega === "en mesa" ? payload.numero_mesa : null,
          },
        ])
        .select()
        .single();

      if (orderErr) return { success: false, error: orderErr.message };

      const orderId = orderData.id;

      // 6. Insertar Detalles de Pedido
      const detailsRows = detailsToInsert.map((d) => ({
        ...d,
        pedido_id: orderId,
      }));
      const { data: insertedDetails, error: detErr } = await supabase
        .from("detalle_pedido")
        .insert(detailsRows)
        .select();

      if (detErr) return { success: false, error: detErr.message };

      // 7. Insertar Pago Inicial
      const metodo = payload.metodo_pago || "efectivo";
      const { data: insertedPayment } = await supabase
        .from("pagos")
        .insert([
          {
            pedido_id: orderId,
            metodo,
            proveedor: payload.proveedor_pago || metodo,
            estado: metodo === "efectivo" ? "pendiente" : "aprobado",
          },
        ])
        .select();

      const createdOrder: Order = {
        id: orderId,
        usuario_id,
        usuario_nombre: user?.nombre || "Cliente Towskan",
        usuario_email: user?.email || "cliente@towskan.com",
        subtotal,
        impuestos,
        envio,
        total,
        estado: "pendiente",
        tipo_entrega: payload.tipo_entrega,
        numero_mesa: payload.numero_mesa || null,
        fecha_pedido: orderData.fecha_pedido || new Date().toISOString(),
        detalles: (insertedDetails || []).map((d: any) => ({
          id: d.id,
          pedido_id: d.pedido_id,
          producto_id: d.producto_id,
          producto_nombre: prodMap.get(d.producto_id)?.nombre || `Producto #${d.producto_id}`,
          cantidad: d.cantidad,
          precio: Number(d.precio),
          subtotal: Number(d.subtotal),
        })),
        pagos: (insertedPayment || []).map((p: any) => ({
          id: p.id,
          pedido_id: p.pedido_id,
          metodo: p.metodo,
          proveedor: p.proveedor,
          estado: p.estado,
          fecha_pago: p.fecha_pago,
        })),
      };

      return { success: true, data: createdOrder };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al procesar el pedido en Supabase." };
    }
  },

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const user = authService.getStoredUser();
      const userId = user?.id;

      let query = supabase
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

      if (userId) {
        query = query.eq("usuario_id", userId);
      }

      const { data, error } = await query;
      if (error) return { success: false, error: error.message };

      const orders: Order[] = (data || []).map((o: any) => ({
        id: o.id,
        usuario_id: o.usuario_id,
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
          producto_nombre: d.productos?.nombre,
          producto_imagen: d.productos?.imagen,
          cantidad: d.cantidad,
          precio: Number(d.precio),
          subtotal: Number(d.subtotal),
        })),
        pagos: o.pagos || [],
      }));

      return { success: true, data: orders };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getById(id: number): Promise<ApiResponse<Order>> {
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
        .eq("id", id)
        .single();

      if (error) return { success: false, error: error.message };

      const o = data as any;
      const order: Order = {
        id: o.id,
        usuario_id: o.usuario_id,
        usuario_nombre: o.usuarios?.nombre || null,
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
          producto_imagen: d.productos?.imagen,
          cantidad: d.cantidad,
          precio: Number(d.precio),
          subtotal: Number(d.subtotal),
        })),
        pagos: o.pagos || [],
      };

      return { success: true, data: order };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getAll(params?: { estado?: OrderStatus; limit?: number; offset?: number }): Promise<ApiResponse<Order[]>> {
    try {
      let query = supabase
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
            productos (nombre)
          )
        `)
        .order("id", { ascending: false });

      if (params?.estado) query = query.eq("estado", params.estado);
      if (params?.limit) query = query.limit(params.limit);

      const { data, error } = await query;
      if (error) return { success: false, error: error.message };

      const orders: Order[] = (data || []).map((o: any) => ({
        id: o.id,
        usuario_id: o.usuario_id,
        usuario_nombre: o.usuarios?.nombre,
        usuario_email: o.usuarios?.email,
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
          producto_nombre: d.productos?.nombre,
          cantidad: d.cantidad,
          precio: Number(d.precio),
          subtotal: Number(d.subtotal),
        })),
      }));

      return { success: true, data: orders };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateStatus(id: number, estado: OrderStatus): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .update({ estado })
        .eq("id", id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return this.getById(id);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async cancel(id: number, razon?: string): Promise<ApiResponse<Order>> {
    try {
      const current = await this.getById(id);
      if (!current.success || !current.data) {
        return { success: false, error: "Pedido no encontrado." };
      }

      if (current.data.estado !== "pendiente") {
        return {
          success: false,
          error: `No es posible cancelar el pedido en estado '${current.data.estado}'. La orden ya se encuentra en proceso de cocina o entrega.`,
        };
      }

      const { data, error } = await supabase
        .from("pedidos")
        .update({ estado: "cancelado" })
        .eq("id", id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return this.getById(id);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getWhatsAppLink(id: number): Promise<ApiResponse<WhatsAppData>> {
    try {
      const orderRes = await this.getById(id);
      if (!orderRes.success || !orderRes.data) {
        return { success: false, error: "Pedido no encontrado." };
      }
      const p = orderRes.data;

      const itemsStr = (p.detalles || [])
        .map((d) => `• ${d.cantidad}x ${d.producto_nombre} ($${d.subtotal.toLocaleString("es-CO")} COP)`)
        .join("\n");

      const modalidad =
        p.tipo_entrega === "en mesa" ? `EN MESA (${p.numero_mesa || "N/A"})` : p.tipo_entrega.toUpperCase();
      const metodo = p.pagos && p.pagos[0] ? p.pagos[0].metodo.toUpperCase() : "POR DEFINIR";

      const mensaje =
        `🔥 *NUEVO PEDIDO TOWSKAN - ORDEN #${p.id}* 🔥\n\n` +
        `👤 *Cliente:* ${p.usuario_nombre || "Cliente Towskan"}\n` +
        `📍 *Modalidad:* ${modalidad}\n\n` +
        `🍔 *PRODUCTOS SOLICITADOS:*\n${itemsStr}\n\n` +
        `💵 *Subtotal:* $${p.subtotal.toLocaleString("es-CO")} COP\n` +
        `🏛️ *Impoconsumo (8%):* $${p.impuestos.toLocaleString("es-CO")} COP\n` +
        `🛵 *Costo Envío:* $${p.envio.toLocaleString("es-CO")} COP\n` +
        `💰 *TOTAL A PAGAR:* $${p.total.toLocaleString("es-CO")} COP\n\n` +
        `💳 *Método de Pago:* ${metodo}\n` +
        `📌 *Estado:* ${p.estado.toUpperCase()}\n\n` +
        `📍 *Valledupar, Cesar* • Towskan Gourmet Express`;

      const phone = "573001234567";
      const encoded = encodeURIComponent(mensaje);
      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;

      return {
        success: true,
        data: {
          order_id: p.id,
          whatsapp_phone: phone,
          raw_message: mensaje,
          whatsapp_url: url,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getReceipt(id: number): Promise<ApiResponse<ReceiptData>> {
    try {
      const orderRes = await this.getById(id);
      if (!orderRes.success || !orderRes.data) {
        return { success: false, error: "Pedido no encontrado." };
      }
      const p = orderRes.data;

      const receipt: ReceiptData = {
        establecimiento: {
          nombre: "TOWSKAN GOURMET EXPRESS",
          nit: "901.834.123-5",
          direccion: "Calle 16 #9-45, Valledupar, Cesar",
          ciudad: "Valledupar, Cesar - Colombia",
          telefono: "+573001234567",
          regimen: "Impuesto Nacional al Consumo (INC 8%) - Art. 512-1 E.T.",
        },
        factura: {
          numero_factura: `TOW-${p.id.toString().padStart(6, "0")}`,
          fecha_emision: p.fecha_pedido || new Date().toISOString(),
          fecha_formateada: p.fecha_pedido
            ? new Date(p.fecha_pedido).toLocaleString("es-CO")
            : new Date().toLocaleString("es-CO"),
          cliente: {
            id: p.usuario_id,
            nombre: p.usuario_nombre || "Consumidor Final",
            email: p.usuario_email || "cliente@towskan.com",
          },
          servicio: {
            tipo_entrega: p.tipo_entrega,
            numero_mesa: p.numero_mesa,
            estado: p.estado,
          },
          items: (p.detalles || []).map((d) => ({
            cantidad: d.cantidad,
            descripcion: d.producto_nombre || "Producto Gourmet",
            precio_unitario: d.precio,
            subtotal: d.subtotal,
          })),
          totales: {
            subtotal: p.subtotal,
            impoconsumo_8: p.impuestos,
            envio: p.envio,
            total: p.total,
          },
          pagos: (p.pagos || []).map((pay) => ({
            id: pay.id,
            metodo: pay.metodo,
            proveedor: pay.proveedor,
            estado: pay.estado,
            fecha: pay.fecha_pago,
          })),
        },
      };

      return { success: true, data: receipt };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getStatus(id: number): Promise<ApiResponse<OrderStatusData>> {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("id, estado, tipo_entrega, numero_mesa, total")
        .eq("id", id)
        .single();

      if (error) return { success: false, error: error.message };

      return {
        success: true,
        data: {
          id: data.id,
          estado: data.estado,
          tipo_entrega: data.tipo_entrega,
          numero_mesa: data.numero_mesa,
          total: Number(data.total),
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async registerPayment(payload: {
    pedido_id: number;
    metodo: PaymentMethod;
    proveedor?: string;
    estado?: PaymentStatus;
  }): Promise<ApiResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from("pagos")
        .insert([
          {
            pedido_id: payload.pedido_id,
            metodo: payload.metodo,
            proveedor: payload.proveedor || payload.metodo,
            estado: payload.estado || "aprobado",
          },
        ])
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      if (payload.estado === "aprobado") {
        await supabase
          .from("pedidos")
          .update({ estado: "preparando" })
          .eq("id", payload.pedido_id);
      }

      return { success: true, data: data as Payment };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
