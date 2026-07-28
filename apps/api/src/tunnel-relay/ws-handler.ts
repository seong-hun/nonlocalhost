import { type ClientFrame, decodeFrame, encodeFrame } from "@nonlocalhost/shared";
import type { Server, ServerWebSocket, WebSocketHandler } from "bun";
import { getPending, removePending } from "./pending";
import { registerConnection, unregisterConnection } from "./registry";
import { authenticateToken, isValidSubdomain, upsertTunnel } from "./repository";
import type { TunnelSocketData } from "./types";

const PING_INTERVAL_MS = 30_000;
const HELLO_TIMEOUT_MS = 10_000;

// 표준 WebSocket 클라이언트(브라우저 포함)는 핸드셰이크에 커스텀 헤더를 못 실으므로,
// 인증은 업그레이드 시점이 아니라 업그레이드 직후 첫 프레임인 hello로 한다.
export function handleTunnelUpgrade(req: Request, server: Server): Response | undefined {
  const data: TunnelSocketData = { userId: null, tokenId: null, subdomain: null };
  const upgraded = server.upgrade(req, { data });
  if (!upgraded) return new Response("Upgrade failed", { status: 400 });
  return undefined;
}

export const tunnelWebSocketHandlers: WebSocketHandler<TunnelSocketData> = {
  open(ws) {
    ws.data.pingInterval = setInterval(() => {
      try {
        ws.send(encodeFrame({ type: "ping" }));
      } catch {
        // 소켓이 이미 닫혔으면 close 훅에서 정리된다
      }
    }, PING_INTERVAL_MS);

    ws.data.helloTimeout = setTimeout(() => {
      ws.send(encodeFrame({ type: "error", message: "hello frame not received in time" }));
      ws.close();
    }, HELLO_TIMEOUT_MS);
  },

  async message(ws, message) {
    if (typeof message === "string") return; // 프로토콜은 바이너리 프레임만 사용한다
    const { header, body } = decodeFrame<ClientFrame>(message);

    if (header.type === "hello") {
      await handleHello(ws, header.token, header.subdomain);
      return;
    }

    if (!ws.data.userId) return; // hello로 인증되기 전에는 다른 프레임을 무시한다

    switch (header.type) {
      case "response-head": {
        getPending(header.id)?.resolveHead({ status: header.status, headers: header.headers });
        break;
      }
      case "response-chunk": {
        getPending(header.id)?.push(body);
        break;
      }
      case "response-end": {
        getPending(header.id)?.end();
        removePending(header.id);
        break;
      }
      case "response-error": {
        getPending(header.id)?.fail(header.message);
        removePending(header.id);
        break;
      }
      case "pong":
        break;
    }
  },

  close(ws) {
    if (ws.data.pingInterval) clearInterval(ws.data.pingInterval);
    if (ws.data.helloTimeout) clearTimeout(ws.data.helloTimeout);
    if (ws.data.subdomain) unregisterConnection(ws.data.subdomain, ws);
  },
};

async function handleHello(
  ws: ServerWebSocket<TunnelSocketData>,
  token: string,
  subdomain: string
) {
  const tokenRow = await authenticateToken(token);
  if (!tokenRow) {
    ws.send(encodeFrame({ type: "error", message: "invalid token" }));
    ws.close();
    return;
  }

  if (!isValidSubdomain(subdomain)) {
    ws.send(encodeFrame({ type: "error", message: "invalid subdomain" }));
    ws.close();
    return;
  }

  const row = await upsertTunnel(tokenRow.userId, subdomain);
  if (!row) {
    ws.send(encodeFrame({ type: "error", message: "subdomain already in use" }));
    ws.close();
    return;
  }

  if (ws.data.helloTimeout) clearTimeout(ws.data.helloTimeout);
  ws.data.userId = tokenRow.userId;
  ws.data.tokenId = tokenRow.id;
  ws.data.subdomain = subdomain;
  registerConnection(subdomain, ws, tokenRow.userId);
  ws.send(encodeFrame({ type: "welcome", subdomain }));
}
