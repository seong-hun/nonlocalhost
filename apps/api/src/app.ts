import { AppError } from "@nonlocalhost/shared";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { authRouter } from "./auth/router";
import { internalRouter } from "./internal/router";
import { tokensRouter } from "./tokens/router";
import { tunnelsRouter } from "./tunnels/router";
import { usersRouter } from "./users/router";

const app = new Hono();

app.use(secureHeaders());
app.use(
  "/api/*",
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);

app.route("/api/auth", authRouter);
app.route("/api/tunnels", tunnelsRouter);
app.route("/api/tokens", tokensRouter);
app.route("/api/users", usersRouter);
app.route("/internal", internalRouter);

app.get("/api/health", (c) => c.json({ status: "ok" }));

if (process.env.NODE_ENV === "production") {
  // Docker: CWD는 /app. 로컬(CWD=apps/api)과 경로가 다르므로 WEB_DIST_ROOT로 오버라이드 가능.
  const webDistRoot = process.env.WEB_DIST_ROOT ?? "../web/dist";
  app.use("/*", serveStatic({ root: webDistRoot }));
  app.use("/*", serveStatic({ path: `${webDistRoot}/index.html` }));
}

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: { code: "NOT_FOUND", message: "Not found" } }, 404);
  }
  // NOTE: 여기서 Hono의 기본 c.notFound()를 쓰면 이 Hono/Bun 버전 조합에서
  // 서버가 100% CPU로 무한루프에 빠지는 문제가 재현됐다. 반드시 명시적 Response를 반환할 것.
  return c.text("Not Found", 404);
});

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503
    );
  }
  console.error(`[api] Unexpected error: ${c.req.method} ${c.req.path}`, err);
  return c.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" } },
    500
  );
});

export default app;
