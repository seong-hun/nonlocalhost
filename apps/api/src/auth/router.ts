import { db, users } from "@nonlocalhost/db";
import { type JwtVariables, jwtMiddleware } from "@nonlocalhost/middleware";
import { AppError } from "@nonlocalhost/shared";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./jwt";

export const authRouter = new Hono<{ Variables: JwtVariables }>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("INVALID_BODY", 400, "email and password are required");
  }

  const user = await db.select().from(users).where(eq(users.email, parsed.data.email)).get();
  if (!user) throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");

  const valid = await Bun.password.verify(parsed.data.password, user.passwordHash);
  if (!valid) throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");

  const accessToken = await signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = await signRefreshToken({ sub: user.id, email: user.email });
  return c.json({ accessToken, refreshToken });
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

authRouter.post("/refresh", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = refreshSchema.safeParse(body);
  if (!parsed.success) throw new AppError("INVALID_BODY", 400, "refreshToken is required");

  const payload = await verifyRefreshToken(parsed.data.refreshToken).catch(() => null);
  if (!payload) throw new AppError("UNAUTHORIZED", 401, "Invalid refresh token");

  const user = await db.select().from(users).where(eq(users.id, payload.sub)).get();
  if (!user) throw new AppError("UNAUTHORIZED", 401, "Invalid refresh token");

  const accessToken = await signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = await signRefreshToken({ sub: user.id, email: user.email });
  return c.json({ accessToken, refreshToken });
});

authRouter.get("/me", jwtMiddleware, (c) => {
  const payload = c.get("jwtPayload");
  return c.json({ id: payload.sub, email: payload.email });
});
