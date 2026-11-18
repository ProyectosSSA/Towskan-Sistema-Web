import { apiRequest, ApiResponse } from "./api";

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
    return apiRequest<QuoteResult>("/orders/quote", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async create(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    return apiRequest<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    return apiRequest<Order[]>("/orders/my-orders", {
      method: "GET",
    });
  },

  async getById(id: number): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(`/orders/${id}`, {
      method: "GET",
    });
  },

  async getAll(params?: { estado?: OrderStatus; limit?: number; offset?: number }): Promise<ApiResponse<Order[]>> {
    const query = new URLSearchParams();
    if (params?.estado) query.append("estado", params.estado);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<Order[]>(`/orders${queryString}`, {
      method: "GET",
    });
  },

  async updateStatus(id: number, estado: OrderStatus): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  },

  async cancel(id: number, razon?: string): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ razon }),
    });
  },

  async getWhatsAppLink(id: number): Promise<ApiResponse<WhatsAppData>> {
    return apiRequest<WhatsAppData>(`/orders/${id}/whatsapp`, {
      method: "GET",
    });
  },

  async getReceipt(id: number): Promise<ApiResponse<ReceiptData>> {
    return apiRequest<ReceiptData>(`/orders/${id}/receipt`, {
      method: "GET",
    });
  },

  async getStatus(id: number): Promise<ApiResponse<OrderStatusData>> {
    return apiRequest<OrderStatusData>(`/orders/${id}/status`, {
      method: "GET",
    });
  },

  async registerPayment(payload: {
    pedido_id: number;
    metodo: PaymentMethod;
    proveedor?: string;
    estado?: PaymentStatus;
  }): Promise<ApiResponse<Payment>> {
    return apiRequest<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
