import { api } from "./api";

export interface Tunnel {
  id: string;
  subdomain: string;
  name: string | null;
  createdAt: string;
  lastConnectedAt: string | null;
  online: boolean;
}

export const tunnelsApi = {
  list: async (): Promise<Tunnel[]> => {
    const { data } = await api.get<{ data: Tunnel[] }>("/tunnels");
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tunnels/${id}`);
  },
};
