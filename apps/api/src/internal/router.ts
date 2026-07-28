import { Hono } from "hono";
import { BASE_DOMAIN } from "../config";
import { isKnownDomain } from "../tunnel-relay/repository";

export const internalRouter = new Hono();

// Caddy on_demand_tls의 ask 훅. 알려진 도메인(베이스 도메인 또는 등록된 서브도메인)에만
// 200을 돌려줘서 임의 서브도메인으로 인증서를 남발시키는 걸 막는다.
internalRouter.get("/tls-ask", async (c) => {
  const domain = c.req.query("domain");
  if (!domain) return c.text("missing domain", 400);
  const known = await isKnownDomain(domain, BASE_DOMAIN);
  return known ? c.text("ok") : c.text("not found", 404);
});
