import axios from "axios";
import { api, type StoredAuth } from "./api";

export interface Me {
  id: string;
  email: string;
  role: "admin" | "member";
}

export const authApi = {
  login: async (email: string, password: string): Promise<StoredAuth> => {
    const { data } = await axios.post<StoredAuth>("/api/auth/login", { email, password });
    return data;
  },

  me: async (): Promise<Me> => {
    const { data } = await api.get<Me>("/auth/me");
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post("/auth/change-password", { currentPassword, newPassword });
  },
};
