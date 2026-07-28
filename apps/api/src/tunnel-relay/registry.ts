import type { ServerWebSocket } from "bun";
import type { TunnelSocketData } from "./types";

interface Connection {
  socket: ServerWebSocket<TunnelSocketData>;
  userId: string;
}

// 서브도메인 -> 현재 연결된 CLI 컨트롤 소켓. 프로세스 하나짜리 서버라 인메모리로 충분하다.
const connections = new Map<string, Connection>();

export function registerConnection(
  subdomain: string,
  socket: ServerWebSocket<TunnelSocketData>,
  userId: string
): void {
  connections.set(subdomain, { socket, userId });
}

export function unregisterConnection(
  subdomain: string,
  socket: ServerWebSocket<TunnelSocketData>
): void {
  const existing = connections.get(subdomain);
  if (existing?.socket === socket) connections.delete(subdomain);
}

export function getConnection(subdomain: string): Connection | undefined {
  return connections.get(subdomain);
}

export function isSubdomainOnline(subdomain: string): boolean {
  return connections.has(subdomain);
}
