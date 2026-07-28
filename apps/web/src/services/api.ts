import axios from "axios";

const STORAGE_KEY = "nlh_auth";

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
}

export function loadAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// 요청: Authorization 헤더 주입
api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth) config.headers.Authorization = `Bearer ${auth.accessToken}`;
  return config;
});

// 응답: 401 -> refresh -> retry (1회). refresh도 실패하면 로그아웃 처리.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const auth = loadAuth();

      if (auth?.refreshToken) {
        try {
          const { data } = await axios.post<StoredAuth>("/api/auth/refresh", {
            refreshToken: auth.refreshToken,
          });
          saveAuth(data);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          clearAuth();
          window.location.reload();
        }
      } else {
        clearAuth();
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);
