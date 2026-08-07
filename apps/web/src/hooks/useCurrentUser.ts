import { useQuery } from "@tanstack/react-query";
import { authApi } from "../services/authApi";

export function useCurrentUser() {
  return useQuery({ queryKey: ["me"], queryFn: authApi.me });
}
