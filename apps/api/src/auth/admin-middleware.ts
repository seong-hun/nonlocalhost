import type { JwtVariables } from "@nonlocalhost/middleware";
import { AppError } from "@nonlocalhost/shared";
import { createMiddleware } from "hono/factory";

const ADMIN_ID = "admin";

export const adminOnly = createMiddleware<{ Variables: JwtVariables }>(async (c, next) => {
  if (c.get("jwtPayload").sub !== ADMIN_ID) {
    throw new AppError("FORBIDDEN", 403, "Admin access required");
  }
  await next();
});
