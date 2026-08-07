import { randomUUID } from "node:crypto";
import { db, tokens, users } from "@nonlocalhost/db";
import { type JwtVariables, jwtMiddleware } from "@nonlocalhost/middleware";
import { AppError } from "@nonlocalhost/shared";
import { and, eq, isNull, ne } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { adminOnly } from "../auth/admin-middleware";

const ADMIN_ID = "admin";

export const usersRouter = new Hono<{ Variables: JwtVariables }>();
usersRouter.use("*", jwtMiddleware, adminOnly);

usersRouter.get("/", async (c) => {
  const rows = await db.select().from(users).where(ne(users.id, ADMIN_ID)).all();
  return c.json({
    data: rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      disabledAt: u.disabledAt,
    })),
  });
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

usersRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("INVALID_BODY", 400, "Valid email and password (min 8 chars) are required");
  }

  const existing = await db.select().from(users).where(eq(users.email, parsed.data.email)).get();
  if (existing) throw new AppError("EMAIL_TAKEN", 409, "Email is already in use");

  const passwordHash = await Bun.password.hash(parsed.data.password, {
    algorithm: "bcrypt",
    cost: 12,
  });
  const row = {
    id: randomUUID(),
    email: parsed.data.email,
    passwordHash,
    role: "member",
    createdAt: new Date(),
  };
  await db.insert(users).values(row);

  return c.json(
    { id: row.id, email: row.email, role: row.role, createdAt: row.createdAt, disabledAt: null },
    201
  );
});

usersRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (id === ADMIN_ID) throw new AppError("FORBIDDEN", 403, "Cannot disable the admin account");

  const row = await db.select().from(users).where(eq(users.id, id)).get();
  if (!row) throw new AppError("NOT_FOUND", 404, "User not found");

  if (!row.disabledAt) {
    const now = new Date();
    await db.update(users).set({ disabledAt: now }).where(eq(users.id, id));
    await db
      .update(tokens)
      .set({ revokedAt: now })
      .where(and(eq(tokens.userId, id), isNull(tokens.revokedAt)));
  }

  return c.body(null, 204);
});
