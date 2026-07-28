import app from "./app";
import { bootstrapAdmin } from "./auth/bootstrap";
import { BASE_DOMAIN } from "./config";
import { proxyToTunnel } from "./tunnel-relay/proxy";
import { handleTunnelUpgrade, tunnelWebSocketHandlers } from "./tunnel-relay/ws-handler";

const port = Number(process.env.PORT ?? "3000");

const server = Bun.serve({
  port,
  async fetch(req, srv) {
    const url = new URL(req.url);
    const host = (req.headers.get("host") ?? "").split(":")[0];

    if (host === BASE_DOMAIN && url.pathname === "/_ws/tunnel") {
      return handleTunnelUpgrade(req, srv);
    }

    if (host !== BASE_DOMAIN && host.endsWith(`.${BASE_DOMAIN}`)) {
      const subdomain = host.slice(0, -(BASE_DOMAIN.length + 1));
      return proxyToTunnel(subdomain, req);
    }

    return app.fetch(req);
  },
  websocket: tunnelWebSocketHandlers,
});

console.log(`[api] Listening on http://localhost:${server.port} (base domain: ${BASE_DOMAIN})`);

bootstrapAdmin().catch((err) => console.error("[api] Admin bootstrap failed:", err));
