import { AppError } from "@nonlocalhost/shared";
import { createMiddleware } from "hono/factory";
import type { JWTPayload } from "jose";
import { jwtVerify } from "jose";

export type JwtVariables = {
  jwtPayload: JWTPayload & { sub: string; email: string };
};

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function toJwtPayload(payload: JWTPayload): JwtVariables["jwtPayload"] {
  const email = (payload as Record<string, unknown>).email;
  if (!payload.sub || typeof email !== "string") {
    throw new AppError("UNAUTHORIZED", 401, "Invalid token payload");
  }
  return { ...payload, sub: payload.sub, email };
}

// 대시보드 로그인 세션용 access token 검증 미들웨어. CLI 터널 토큰(opaque)과는 별개.
export const jwtMiddleware = createMiddleware<{ Variables: JwtVariables }>(async (c, next) => {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", 401, "Missing or invalid Authorization header");
  }

  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    c.set("jwtPayload", toJwtPayload(payload));
    await next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof Error && err.message.toLowerCase().includes("expired")) {
      throw new AppError("TOKEN_EXPIRED", 401, "Token has expired");
    }
    throw new AppError("UNAUTHORIZED", 401, "Invalid token");
  }
});
