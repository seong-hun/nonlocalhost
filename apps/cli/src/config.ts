import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "nonlocalhost");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export interface StoredConfig {
  token?: string;
  server?: string;
}

export async function readConfig(): Promise<StoredConfig> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) return {};
  try {
    return (await file.json()) as StoredConfig;
  } catch {
    return {};
  }
}

export async function writeConfig(config: StoredConfig): Promise<void> {
  await Bun.write(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}
