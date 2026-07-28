import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as tokensSchema from "./schema/tokens";
import * as tunnelsSchema from "./schema/tunnels";
import * as usersSchema from "./schema/users";

const schema = {
  ...usersSchema,
  ...tunnelsSchema,
  ...tokensSchema,
};

function createDb() {
  const path = process.env.DATABASE_PATH ?? "./data/nonlocalhost.db";
  const sqlite = new Database(path, { create: true });
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  return drizzle(sqlite, { schema });
}

let _db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
