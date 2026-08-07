import { db, users } from "@nonlocalhost/db";
import { eq } from "drizzle-orm";

// 단일 관리자 계정이므로 항상 고정된 id를 쓴다 — 여러 행이 생길 여지를 원천 차단.
const ADMIN_ID = "admin";

// ADMIN_SEED=email:password. 관리자 계정이 없으면 생성하고, 있으면 email/password를 동기화한다.
export async function bootstrapAdmin(): Promise<void> {
  const seed = process.env.ADMIN_SEED;
  if (!seed) {
    console.warn(
      "[api] ADMIN_SEED not set. Set ADMIN_SEED=email:password to create the admin account."
    );
    return;
  }

  const colonIdx = seed.indexOf(":");
  if (colonIdx === -1) {
    console.error("[api] ADMIN_SEED format invalid. Expected 'email:password'.");
    return;
  }

  const email = seed.slice(0, colonIdx);
  const password = seed.slice(colonIdx + 1);
  if (!email || !password) {
    console.error("[api] ADMIN_SEED format invalid. email and password are required.");
    return;
  }

  const existing = await db.select().from(users).where(eq(users.id, ADMIN_ID)).get();

  if (existing) {
    const emailMatches = existing.email === email;
    const passwordMatches = await Bun.password.verify(password, existing.passwordHash);
    const roleMatches = existing.role === "admin";
    if (emailMatches && passwordMatches && roleMatches) return;

    const passwordHash = passwordMatches
      ? existing.passwordHash
      : await Bun.password.hash(password, { algorithm: "bcrypt", cost: 12 });
    await db
      .update(users)
      .set({ email, passwordHash, role: "admin" })
      .where(eq(users.id, ADMIN_ID));
    console.log("[api] Admin account synced from ADMIN_SEED.");
    return;
  }

  const passwordHash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 12 });
  await db
    .insert(users)
    .values({ id: ADMIN_ID, email, passwordHash, role: "admin", createdAt: new Date() });
  console.log(`[api] Admin account created: ${email}`);
}
