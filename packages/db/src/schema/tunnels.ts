import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// 서브도메인은 CLI가 처음 hello 프레임을 보낼 때 upsert로 등록된다.
// 대시보드에서 미리 예약하는 흐름은 없다 — 관리자 혼자 쓰므로 충돌 걱정이 없다.
export const tunnels = sqliteTable("tunnels", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subdomain: text("subdomain").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  lastConnectedAt: integer("last_connected_at", { mode: "timestamp" }),
});
