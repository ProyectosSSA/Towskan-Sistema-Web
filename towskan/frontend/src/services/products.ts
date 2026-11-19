import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./api";

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
    try {
      let query = supabase
        .from("productos")
        .select(`
          id,
          categoria_id,
          nombre,
          descripcion,
          precio,
          imagen,
          disponible,
          fecha_creacion,
          categorias (nombre_categoria)
        `)
        .order("id", { ascending: true });

      if (params?.categoria_id !== undefined) {
        query = query.eq("categoria_id", params.categoria_id);
      }
      if (params?.disponible !== undefined) {
        query = query.eq("disponible", params.disponible);
      }
      if (params?.search) {
        query = query.ilike("nombre", `%${params.search}%`);
      }

      const { data, error } = await query;
      if (error) {
        return { success: false, error: error.message };
      }

      const mapped: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        categoria_id: p.categoria_id,
        categoria_nombre: p.categorias?.nombre_categoria || null,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        imagen: p.imagen,
        disponible: Boolean(p.disponible),
        fecha_creacion: p.fecha_creacion,
      }));

      return { success: true, data: mapped };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Error al consultar productos en Supabase.",
      };
    }
  },

  async getById(id: number): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(`
          id,
          categoria_id,
          nombre,
          descripcion,
          precio,
          imagen,
          disponible,
          fecha_creacion,
          categorias (nombre_categoria)
        `)
        .eq("id", id)
        .single();

      if (error) return { success: false, error: error.message };

      const mapped: Product = {
        id: (data as any).id,
        categoria_id: (data as any).categoria_id,
        categoria_nombre: (data as any).categorias?.nombre_categoria || null,
        nombre: (data as any).nombre,
        descripcion: (data as any).descripcion,
        precio: Number((data as any).precio),
        imagen: (data as any).imagen,
        disponible: Boolean((data as any).disponible),
        fecha_creacion: (data as any).fecha_creacion,
      };

      return { success: true, data: mapped };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async create(data: {
    categoria_id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagen?: string;
    disponible?: boolean;
  }): Promise<ApiResponse<Product>> {
    try {
      const { data: created, error } = await supabase
        .from("productos")
        .insert([data])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: created as Product };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
    try {
      const { data: updated, error } = await supabase
        .from("productos")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: updated as Product };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleAvailability(id: number, disponible?: boolean): Promise<ApiResponse<Product>> {
    try {
      let nextState = disponible;
      if (nextState === undefined) {
        const current = await productService.getById(id);
        if (current.data) nextState = !current.data.disponible;
        else nextState = true;
      }

      const { data, error } = await supabase
        .from("productos")
        .update({ disponible: nextState })
        .eq("id", id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Product };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from("productos").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
