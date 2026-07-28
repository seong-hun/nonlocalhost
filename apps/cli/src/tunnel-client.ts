import {
  type ClientFrame,
  decodeFrame,
  encodeFrame,
  HOP_BY_HOP_HEADERS,
  type RequestFrame,
  type ServerFrame,
} from "@nonlocalhost/shared";

export interface RunOptions {
  server: string;
  token: string;
  subdomain: string;
  localHost: string;
  port: number;
  insecure: boolean;
}

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

export async function runTunnel(opts: RunOptions): Promise<never> {
  let attempt = 0;
  for (;;) {
    let welcomed = false;
    try {
      welcomed = await connectOnce(opts);
    } catch (err) {
      console.error(`[nonlocalhost] connection error: ${(err as Error).message}`);
    }

    attempt = welcomed ? 0 : attempt + 1;
    const delay =
      Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt) + Math.random() * 500;
    console.log(`[nonlocalhost] reconnecting in ${Math.round(delay / 1000)}s...`);
    await Bun.sleep(delay);
  }
}

function wsUrl(opts: RunOptions): string {
  const scheme = opts.insecure ? "ws" : "wss";
  return `${scheme}://${opts.server}/_ws/tunnel`;
}

// 연결 하나의 생명주기를 처리한다. handshake(welcome)까지 도달했었는지를 resolve로 알려줘서
// 호출자가 재연결 backoff를 리셋할지 판단할 수 있게 한다.
function connectOnce(opts: RunOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl(opts));
    ws.binaryType = "arraybuffer";
    let welcomed = false;

    ws.addEventListener("open", () => {
      ws.send(
        encodeFrame({
          type: "hello",
          token: opts.token,
          subdomain: opts.subdomain,
        } satisfies ClientFrame)
      );
    });

    ws.addEventListener("message", (evt) => {
      const { header, body } = decodeFrame<ServerFrame>(evt.data as ArrayBuffer);
      switch (header.type) {
        case "welcome":
          welcomed = true;
          printWelcome(opts, header.subdomain);
          break;
        case "error":
          console.error(`[nonlocalhost] server error: ${header.message}`);
          break;
        case "ping":
          ws.send(encodeFrame({ type: "pong" } satisfies ClientFrame));
          break;
        case "request":
          forwardRequest(ws, header, body, opts).catch((err) =>
            console.error(`[nonlocalhost] request forwarding failed: ${(err as Error).message}`)
          );
          break;
      }
    });

    ws.addEventListener("close", (evt) => {
      if (welcomed) {
        console.log(
          `[nonlocalhost] disconnected (${evt.code}${evt.reason ? ` ${evt.reason}` : ""})`
        );
      }
      resolve(welcomed);
    });

    ws.addEventListener("error", () => {
      // close 이벤트가 뒤이어 발생하므로 여기서는 별도 처리하지 않는다
    });
  });
}

async function forwardRequest(
  ws: WebSocket,
  header: RequestFrame,
  body: Uint8Array,
  opts: RunOptions
): Promise<void> {
  const start = Date.now();
  const url = `http://${opts.localHost}:${opts.port}${header.path}${header.query}`;
  const hasBody = body.byteLength > 0 && header.method !== "GET" && header.method !== "HEAD";

  try {
    const res = await fetch(url, {
      method: header.method,
      headers: header.headers,
      body: hasBody ? body : undefined,
    });

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) resHeaders[key] = value;
    });

    ws.send(
      encodeFrame({
        type: "response-head",
        id: header.id,
        status: res.status,
        headers: resHeaders,
      } satisfies ClientFrame)
    );

    if (res.body) {
      const reader = res.body.getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        ws.send(
          encodeFrame({ type: "response-chunk", id: header.id } satisfies ClientFrame, value)
        );
      }
    }
    ws.send(encodeFrame({ type: "response-end", id: header.id } satisfies ClientFrame));

    console.log(`${header.method} ${header.path} ${res.status} ${Date.now() - start}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ws.send(encodeFrame({ type: "response-error", id: header.id, message } satisfies ClientFrame));
    console.log(`${header.method} ${header.path} ERR ${message}`);
  }
}

function printWelcome(opts: RunOptions, subdomain: string): void {
  const scheme = opts.insecure ? "http" : "https";
  const publicUrl = `${scheme}://${subdomain}.${opts.server}`;
  const hmrHost = `${subdomain}.${opts.server}`;
  console.log(`[nonlocalhost] connected: ${publicUrl} -> http://${opts.localHost}:${opts.port}`);
  console.log("[nonlocalhost] Vite 사용 시 vite.config.ts에 아래를 추가하세요:");
  console.log(
    `  server: { allowedHosts: ["${hmrHost}"], hmr: { host: "${hmrHost}", clientPort: 443 } }`
  );
}
