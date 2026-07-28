import { getJwtSecret } from "@nonlocalhost/middleware";
import { jwtVerify, SignJWT } from "jose";

export interface TokenSubject {
  sub: string;
  email: string;
}

export async function signAccessToken({ sub, email }: TokenSubject): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function signRefreshToken({ sub, email }: TokenSubject): Promise<string> {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? "7");
  return new SignJWT({ email, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(getJwtSecret());
}

export async function verifyRefreshToken(token: string): Promise<TokenSubject> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  const email = (payload as Record<string, unknown>).email;
  const type = (payload as Record<string, unknown>).type;
  if (!payload.sub || typeof email !== "string" || type !== "refresh") {
    throw new Error("Invalid refresh token payload");
  }
  return { sub: payload.sub, email };
}
