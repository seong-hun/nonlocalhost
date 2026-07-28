import { useCallback, useState } from "react";
import { clearAuth, loadAuth, type StoredAuth, saveAuth } from "../services/api";

export function useAuth() {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadAuth());

  const login = useCallback((tokens: StoredAuth) => {
    saveAuth(tokens);
    setAuth(tokens);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuth(null);
  }, []);

  return { isAuthenticated: auth !== null, login, logout };
}
