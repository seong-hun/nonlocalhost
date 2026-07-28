import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { getDb } from "./client";

migrate(getDb(), { migrationsFolder: `${import.meta.dir}/../drizzle` });
console.log("[db] migrations applied");
