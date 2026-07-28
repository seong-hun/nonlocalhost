import { db, tunnels } from "@nonlocalhost/db";
import { type JwtVariables, jwtMiddleware } from "@nonlocalhost/middleware";
import { AppError } from "@nonlocalhost/shared";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isSubdomainOnline } from "../tunnel-relay/registry";

export const tunnelsRouter = new Hono<{ Variables: JwtVariables }>();
tunnelsRouter.use("*", jwtMiddleware);

tunnelsRouter.get("/", async (c) => {
  const userId = c.get("jwtPayload").sub;
  const rows = await db.select().from(tunnels).where(eq(tunnels.userId, userId)).all();
  return c.json({
    data: rows.map((t) => ({
      id: t.id,
      subdomain: t.subdomain,
      name: t.name,
      createdAt: t.createdAt,
      lastConnectedAt: t.lastConnectedAt,
      online: isSubdomainOnline(t.subdomain),
    })),
  });
});

tunnelsRouter.delete("/:id", async (c) => {
  const userId = c.get("jwtPayload").sub;
  const id = c.req.param("id");
  const row = await db.select().from(tunnels).where(eq(tunnels.id, id)).get();
  if (!row || row.userId !== userId) throw new AppError("NOT_FOUND", 404, "Tunnel not found");
  await db.delete(tunnels).where(eq(tunnels.id, id));
  return c.body(null, 204);
});
