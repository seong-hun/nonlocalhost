import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "nonlocalhost");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const PROJECTS_DIR = join(CONFIG_DIR, "projects");

// the only thing that ever touches the project directory: a self-gitignored
// marker holding a random ref, so settings survive dir renames/moves but a
// fresh git clone (which never gets this untracked marker) starts blank
const PROJECT_CWD = resolve(".");
const PROJECT_MARKER_DIR = join(PROJECT_CWD, ".nonlocalhost");
const PROJECT_REF_PATH = join(PROJECT_MARKER_DIR, "project-ref");

function projectConfigPathFor(ref: string): string {
  return join(PROJECTS_DIR, `${ref}.json`);
}

// reads the ref if a project has already been saved; only creates the marker
// (and its own nested .gitignore) the first time something is actually saved
function getProjectRef(create: boolean): string | undefined {
  if (existsSync(PROJECT_REF_PATH)) return readFileSync(PROJECT_REF_PATH, "utf8").trim();
  if (!create) return undefined;
  mkdirSync(PROJECT_MARKER_DIR, { recursive: true });
  const ref = randomUUID();
  writeFileSync(PROJECT_REF_PATH, `${ref}\n`);
  writeFileSync(join(PROJECT_MARKER_DIR, ".gitignore"), "*\n");
  return ref;
}

// resolves to where project settings would be saved, even before a ref exists
export function projectConfigLocation(): string {
  const ref = getProjectRef(false);
  return ref ? projectConfigPathFor(ref) : `${PROJECTS_DIR}/<new>.json (via ${PROJECT_REF_PATH})`;
}

// account-level: secrets, lives under $HOME, never in a project dir
export interface StoredConfig {
  token?: string;
  server?: string;
}

// project-level: no secrets, keyed by a ref marker in the project dir but
// actually stored under $HOME
export interface ProjectConfig {
  path?: string;
  port?: number;
  subdomain?: string;
  localHost?: string;
  insecure?: boolean;
}

export async function updateProjectConfig(patch: Partial<ProjectConfig>): Promise<ProjectConfig> {
  const existing = await readProjectConfig();
  const merged = { ...existing, ...patch };
  await writeProjectConfig(merged);
  return merged;
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
  const ref = getProjectRef(false);
  if (!ref) return {};
  const file = Bun.file(projectConfigPathFor(ref));
  if (!(await file.exists())) return {};
  try {
    return (await file.json()) as ProjectConfig;
  } catch {
    return {};
  }
}

export async function writeProjectConfig(config: ProjectConfig): Promise<void> {
  const ref = getProjectRef(true) as string;
  const withPath = { path: PROJECT_CWD, ...config };
  await Bun.write(projectConfigPathFor(ref), `${JSON.stringify(withPath, null, 2)}\n`);
}

export function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return `${token.slice(0, 7)}...${token.slice(-4)}`;
}
