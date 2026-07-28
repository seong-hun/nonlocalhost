// 터널 컨트롤 WebSocket 위에서 오가는 프레임 정의.
// 와이어 포맷: [4바이트 BE 헤더 길이][UTF-8 JSON 헤더][나머지 = raw body bytes]
// body가 바이너리일 수 있어(이미지, gzip 등) JSON 하나로 안 묶고 별도 섹션으로 둔다.

export interface HelloFrame {
  type: "hello";
  token: string;
  subdomain: string;
}

export interface PongFrame {
  type: "pong";
}

export interface ResponseHeadFrame {
  type: "response-head";
  id: string;
  status: number;
  headers: Record<string, string>;
}

export interface ResponseChunkFrame {
  type: "response-chunk";
  id: string;
}

export interface ResponseEndFrame {
  type: "response-end";
  id: string;
}

export interface ResponseErrorFrame {
  type: "response-error";
  id: string;
  message: string;
}

// 클라이언트(CLI, 로컬 머신) -> 서버
export type ClientFrame =
  | HelloFrame
  | PongFrame
  | ResponseHeadFrame
  | ResponseChunkFrame
  | ResponseEndFrame
  | ResponseErrorFrame;

export interface WelcomeFrame {
  type: "welcome";
  subdomain: string;
}

export interface ServerErrorFrame {
  type: "error";
  message: string;
}

export interface RequestFrame {
  type: "request";
  id: string;
  method: string;
  path: string;
  query: string;
  headers: Record<string, string>;
}

export interface PingFrame {
  type: "ping";
}

// 서버 -> 클라이언트
export type ServerFrame = WelcomeFrame | ServerErrorFrame | RequestFrame | PingFrame;

export function encodeFrame(header: unknown, body?: Uint8Array | null): Uint8Array {
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  const bodyBytes = body ?? new Uint8Array(0);
  const out = new Uint8Array(4 + headerBytes.length + bodyBytes.length);
  new DataView(out.buffer).setUint32(0, headerBytes.length, false);
  out.set(headerBytes, 4);
  out.set(bodyBytes, 4 + headerBytes.length);
  return out;
}

export function decodeFrame<T>(data: ArrayBuffer | Uint8Array): { header: T; body: Uint8Array } {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerLen = view.getUint32(0, false);
  const headerBytes = bytes.subarray(4, 4 + headerLen);
  const body = bytes.subarray(4 + headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes)) as T;
  return { header, body };
}

// 요청/헤더 hop-by-hop 헤더는 릴레이하지 않는다 (연결별로 의미가 다름).
export const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);
