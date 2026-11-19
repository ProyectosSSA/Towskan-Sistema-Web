import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./api";

export interface Category {
  id: number;
  nombre_categoria: string;
  descripcion?: string | null;
  total_productos?: number;
}

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre_categoria, descripcion")
        .order("id", { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data as Category[] };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Error al consultar categorías en Supabase.",
      };
    }
  },

  async getById(id: number): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre_categoria, descripcion")
        .eq("id", id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data as Category };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async create(data: { nombre_categoria: string; descripcion?: string }): Promise<ApiResponse<Category>> {
    try {
      const { data: created, error } = await supabase
        .from("categorias")
        .insert([data])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: created as Category };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async update(id: number, data: { nombre_categoria?: string; descripcion?: string }): Promise<ApiResponse<Category>> {
    try {
      const { data: updated, error } = await supabase
        .from("categorias")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: updated as Category };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
