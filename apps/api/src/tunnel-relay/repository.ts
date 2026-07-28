import { createHash, randomUUID } from "node:crypto";
import { db, tokens, tunnels } from "@nonlocalhost/db";
import { and, eq, isNull } from "drizzle-orm";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticateToken(token: string) {
  const hash = hashToken(token);
  const row = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.tokenHash, hash), isNull(tokens.revokedAt)))
    .get();
  if (!row) return null;
  await db.update(tokens).set({ lastUsedAt: new Date() }).where(eq(tokens.id, row.id));
  return row;
}

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;

export function isValidSubdomain(subdomain: string): boolean {
  return SUBDOMAIN_RE.test(subdomain);
}

// CLI가 hello로 보낸 서브도메인을 등록한다. 대시보드에서 미리 예약하는 흐름 없이
// 처음 연결하는 순간 upsert된다 — 관리자 혼자 쓰는 서비스라 충돌 걱정이 없다.
export async function upsertTunnel(userId: string, subdomain: string) {
  const existing = await db.select().from(tunnels).where(eq(tunnels.subdomain, subdomain)).get();
  if (existing) {
    if (existing.userId !== userId) return null;
    await db
      .update(tunnels)
      .set({ lastConnectedAt: new Date() })
      .where(eq(tunnels.id, existing.id));
    return existing;
  }

  const row = {
    id: randomUUID(),
    userId,
    subdomain,
    name: null,
    createdAt: new Date(),
    lastConnectedAt: new Date(),
  };
  await db.insert(tunnels).values(row);
  return row;
}

export async function isKnownDomain(host: string, baseDomain: string): Promise<boolean> {
  if (host === baseDomain) return true;
  if (!host.endsWith(`.${baseDomain}`)) return false;
  const subdomain = host.slice(0, -(baseDomain.length + 1));
  const row = await db.select().from(tunnels).where(eq(tunnels.subdomain, subdomain)).get();
  return !!row;
}
