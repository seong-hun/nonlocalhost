import { api } from "./api";

export interface Member {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  disabledAt: string | null;
}

export const usersApi = {
  list: async (): Promise<Member[]> => {
    const { data } = await api.get<{ data: Member[] }>("/users");
    return data.data;
  },

  create: async (email: string, password: string): Promise<Member> => {
    const { data } = await api.post<Member>("/users", { email, password });
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
