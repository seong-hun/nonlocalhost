import { api } from "./api";

export interface CliToken {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export const tokensApi = {
  list: async (): Promise<CliToken[]> => {
    const { data } = await api.get<{ data: CliToken[] }>("/tokens");
    return data.data;
  },

  create: async (name: string): Promise<string> => {
    const { data } = await api.post<{ token: string }>("/tokens", { name });
    return data.token;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tokens/${id}`);
  },
};
