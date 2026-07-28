import { describe, expect, test } from "bun:test";
import app from "./app";

describe("app", () => {
  // 회귀 테스트: Hono의 기본 c.notFound()가 이 Hono/Bun 버전 조합에서 서버를 100% CPU로
  // 무한루프에 빠뜨리는 버그가 있었다 (app.ts 참고). 응답이 타임아웃 없이 빨리 와야 한다.
  test("returns 404 quickly for unmatched non-api paths", async () => {
    const req = new Request("http://localhost/does-not-exist");
    const res = await Promise.race([
      app.fetch(req),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timed out")), 2000)),
    ]);
    expect(res.status).toBe(404);
  });

  test("returns json 404 for unmatched /api paths", async () => {
    const res = await app.fetch(new Request("http://localhost/api/does-not-exist"));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });

  test("health check responds ok", async () => {
    const res = await app.fetch(new Request("http://localhost/api/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  test("rejects login without credentials", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  test("rejects tunnels list without auth", async () => {
    const res = await app.fetch(new Request("http://localhost/api/tunnels"));
    expect(res.status).toBe(401);
  });
});
