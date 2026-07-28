import { randomUUID } from "node:crypto";
import { encodeFrame, HOP_BY_HOP_HEADERS } from "@nonlocalhost/shared";
import { registerPending, removePending } from "./pending";
import { getConnection } from "./registry";

const FIRST_BYTE_TIMEOUT_MS = 30_000;
const MAX_REQUEST_BODY_BYTES = 50 * 1024 * 1024;

export async function proxyToTunnel(subdomain: string, req: Request): Promise<Response> {
  const conn = getConnection(subdomain);
  if (!conn) return offlineResponse(subdomain);

  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }

  const id = randomUUID();
  const url = new URL(req.url);
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) headers[key] = value;
  });

  let body: Uint8Array | undefined;
  if (req.body) {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > MAX_REQUEST_BODY_BYTES)
      return new Response("Payload too large", { status: 413 });
    body = new Uint8Array(buf);
  }

  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });

  const headResult = await new Promise<
    { ok: true; status: number; headers: Record<string, string> } | { ok: false; message: string }
  >((resolve) => {
    const timeout = setTimeout(() => {
      removePending(id);
      resolve({ ok: false, message: "tunnel response timed out" });
    }, FIRST_BYTE_TIMEOUT_MS);

    registerPending(id, {
      resolveHead: (head) => {
        clearTimeout(timeout);
        resolve({ ok: true, ...head });
      },
      push: (chunk) => controller?.enqueue(chunk),
      end: () => controller?.close(),
      fail: (message) => {
        clearTimeout(timeout);
        controller?.error(new Error(message));
        resolve({ ok: false, message });
      },
    });

    conn.socket.send(
      encodeFrame(
        { type: "request", id, method: req.method, path: url.pathname, query: url.search, headers },
        body
      )
    );
  });

  if (!headResult.ok) {
    removePending(id);
    return offlineResponse(subdomain);
  }

  const resHeaders = new Headers();
  for (const [key, value] of Object.entries(headResult.headers)) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) resHeaders.set(key, value);
  }
  return new Response(stream, { status: headResult.status, headers: resHeaders });
}

function offlineResponse(subdomain: string): Response {
  const safe = subdomain.replace(/[<>&"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
  const html = `<!doctype html><html><body style="font-family:sans-serif;text-align:center;padding:4rem">
<h1>Tunnel offline</h1><p><code>${safe}</code> is not currently connected.</p></body></html>`;
  return new Response(html, {
    status: 502,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
