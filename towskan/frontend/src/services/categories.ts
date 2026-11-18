import { apiRequest, ApiResponse } from "./api";

export interface Category {
  id: number;
  nombre_categoria: string;
  descripcion?: string | null;
  total_productos?: number;
}

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return apiRequest<Category[]>("/categories", {
      method: "GET",
    });
  },

  async getById(id: number): Promise<ApiResponse<Category>> {
    return apiRequest<Category>(`/categories/${id}`, {
      method: "GET",
    });
  },

  async create(data: { nombre_categoria: string; descripcion?: string }): Promise<ApiResponse<Category>> {
    return apiRequest<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: { nombre_categoria?: string; descripcion?: string }): Promise<ApiResponse<Category>> {
    return apiRequest<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};

