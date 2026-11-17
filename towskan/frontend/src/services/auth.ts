import { apiRequest, ApiResponse } from "./api";

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
    const res = await apiRequest<AuthResponseData>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, email, password }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem("towskan_token", res.data.token);
      localStorage.setItem("towskan_user", JSON.stringify(res.data.user));
    }

    return res;
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiRequest<AuthResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem("towskan_token", res.data.token);
      localStorage.setItem("towskan_user", JSON.stringify(res.data.user));
    }

    return res;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest<User>("/auth/me", {
      method: "GET",
    });
  },

  logout(): void {
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
};
