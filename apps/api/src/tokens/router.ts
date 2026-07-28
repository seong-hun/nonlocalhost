import { randomBytes, randomUUID } from "node:crypto";
import { db, tokens } from "@nonlocalhost/db";
import { type JwtVariables, jwtMiddleware } from "@nonlocalhost/middleware";
import { AppError } from "@nonlocalhost/shared";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { hashToken } from "../tunnel-relay/repository";

export const tokensRouter = new Hono<{ Variables: JwtVariables }>();
tokensRouter.use("*", jwtMiddleware);

tokensRouter.get("/", async (c) => {
  const userId = c.get("jwtPayload").sub;
  const rows = await db.select().from(tokens).where(eq(tokens.userId, userId)).all();
  return c.json({
    data: rows.map((t) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      lastUsedAt: t.lastUsedAt,
      revokedAt: t.revokedAt,
    })),
  });
});

const createSchema = z.object({ name: z.string().min(1).max(100) });

// 원문 토큰은 발급 응답에서 딱 한 번만 노출된다. DB엔 해시만 저장.
tokensRouter.post("/", async (c) => {
  const userId = c.get("jwtPayload").sub;
  const body = await c.req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) throw new AppError("INVALID_BODY", 400, "name is required");

  const rawToken = `nlh_${randomBytes(32).toString("hex")}`;
  await db.insert(tokens).values({
    id: randomUUID(),
    userId,
    name: parsed.data.name,
    tokenHash: hashToken(rawToken),
    createdAt: new Date(),
  });

  return c.json({ token: rawToken }, 201);
});

tokensRouter.delete("/:id", async (c) => {
  const userId = c.get("jwtPayload").sub;
  const id = c.req.param("id");
  const row = await db.select().from(tokens).where(eq(tokens.id, id)).get();
  if (!row || row.userId !== userId) throw new AppError("NOT_FOUND", 404, "Token not found");
  await db.update(tokens).set({ revokedAt: new Date() }).where(eq(tokens.id, id));
  return c.body(null, 204);
});
