import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// CLI 인증용 opaque 토큰(사용자 단위, 특정 터널에 묶이지 않음). 원문은 발급 시 1회만 노출하고
// DB엔 sha256 해시만 저장한다.
export const tokens = sqliteTable("tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
});
