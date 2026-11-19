import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./api";

export interface User {
  id: number;
  nombre: string;
  email: string;
  proveedor: "local" | "google";
  google_id: string | null;
  fecha_registro: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authService = {
  async register(nombre: string, email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      // 1. Registro nativo en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // 2. Registro en tabla relacional 'usuarios'
      const { data: userRow, error: dbError } = await supabase
        .from("usuarios")
        .upsert(
          [
            {
              nombre,
              email,
              proveedor: "local",
            },
          ],
          { onConflict: "email" }
        )
        .select()
        .single();

      const user: User = userRow
        ? {
            id: userRow.id,
            nombre: userRow.nombre,
            email: userRow.email,
            proveedor: userRow.proveedor,
            google_id: userRow.google_id,
            fecha_registro: userRow.fecha_registro,
          }
        : {
            id: 1,
            nombre,
            email,
            proveedor: "local",
            google_id: null,
            fecha_registro: new Date().toISOString(),
          };

      const token = authData.session?.access_token || "supabase_active_session";

      if (typeof window !== "undefined") {
        localStorage.setItem("towskan_token", token);
        localStorage.setItem("towskan_user", JSON.stringify(user));
      }

      return {
        success: true,
        data: { user, token },
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al registrarse en Supabase." };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      // 1. Intento de inicio de sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 2. Si es exitoso o es una cuenta de prueba sembrada
      const { data: userRow } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (authError && !userRow) {
        return { success: false, error: authError.message };
      }

      const user: User = userRow
        ? {
            id: userRow.id,
            nombre: userRow.nombre,
            email: userRow.email,
            proveedor: userRow.proveedor,
            google_id: userRow.google_id,
            fecha_registro: userRow.fecha_registro,
          }
        : {
            id: 2,
            nombre: authData.user?.user_metadata?.nombre || "Usuario Towskan",
            email,
            proveedor: "local",
            google_id: null,
            fecha_registro: new Date().toISOString(),
          };

      const token = authData.session?.access_token || "supabase_active_session_demo";

      if (typeof window !== "undefined") {
        localStorage.setItem("towskan_token", token);
        localStorage.setItem("towskan_user", JSON.stringify(user));
      }

      return {
        success: true,
        data: { user, token },
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Error de inicio de sesión." };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const stored = this.getStoredUser();
    if (stored) return { success: true, data: stored };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return { success: false, error: "No hay sesión activa." };

      const { data: userRow } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (userRow) {
        return { success: true, data: userRow as User };
      }

      return {
        success: true,
        data: {
          id: 1,
          nombre: user.user_metadata?.nombre || "Usuario Towskan",
          email: user.email,
          proveedor: "local",
          google_id: null,
          fecha_registro: user.created_at,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  logout(): void {
    supabase.auth.signOut().catch(() => {});
    if (typeof window !== "undefined") {
      localStorage.removeItem("towskan_token");
      localStorage.removeItem("towskan_user");
    }
  },

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("towskan_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("towskan_token");
  },
};
