import { apiRequest, ApiResponse } from "./api";

export interface Product {
  id: number;
  categoria_id: number;
  categoria_nombre?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagen?: string | null;
  disponible: boolean;
  fecha_creacion?: string | null;
}

export interface ProductFilterParams {
  categoria_id?: number;
  disponible?: boolean;
  search?: string;
}

export const productService = {
  async getAll(params?: ProductFilterParams): Promise<ApiResponse<Product[]>> {
    const query = new URLSearchParams();
    if (params?.categoria_id !== undefined) query.append("categoria_id", params.categoria_id.toString());
    if (params?.disponible !== undefined) query.append("disponible", params.disponible.toString());
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<Product[]>(`/products${queryString}`, {
      method: "GET",
    });
  },

  async getById(id: number): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/products/${id}`, {
      method: "GET",
    });
  },

  async create(data: {
    categoria_id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagen?: string;
    disponible?: boolean;
  }): Promise<ApiResponse<Product>> {
    return apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    id: number,
    data: {
      categoria_id?: number;
      nombre?: string;
      descripcion?: string;
      precio?: number;
      imagen?: string;
      disponible?: boolean;
    }
  ): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async toggleAvailability(id: number, disponible?: boolean): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/products/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify(disponible !== undefined ? { disponible } : {}),
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/products/${id}`, {
      method: "DELETE",
    });
  },
};

