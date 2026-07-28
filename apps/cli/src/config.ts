import { chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "nonlocalhost");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");
export const PROJECT_CONFIG_PATH = resolve(".nonlocalhost.json");

// account-level: secrets, lives under $HOME, never in a project dir
export interface StoredConfig {
  token?: string;
  server?: string;
}

// project-level: no secrets, safe to commit or leave in a working directory
export interface ProjectConfig {
  port?: number;
  subdomain?: string;
  localHost?: string;
  insecure?: boolean;
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
  // contains a bearer token: keep it readable only by the owning user
  await chmod(CONFIG_PATH, 0o600);
}

export async function readProjectConfig(): Promise<ProjectConfig> {
  const file = Bun.file(PROJECT_CONFIG_PATH);
  if (!(await file.exists())) return {};
  try {
    return (await file.json()) as ProjectConfig;
  } catch {
    return {};
  }
}

export async function writeProjectConfig(config: ProjectConfig): Promise<void> {
  await Bun.write(PROJECT_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}

export function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return `${token.slice(0, 7)}...${token.slice(-4)}`;
}
