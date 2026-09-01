import * as p from "@clack/prompts";
import {
  CONFIG_PATH,
  PROJECT_CONFIG_PATH,
  maskToken,
  readConfig,
  readProjectConfig,
  updateProjectConfig,
  writeConfig,
} from "./config";

const USAGE =
  "Usage: nonlocalhost login [--token <token>] [--server <host>] [--subdomain <name>] [--port <n>]";

interface LoginFlags {
  token?: string;
  server?: string;
  subdomain?: string;
  port?: number;
}

function parseLoginArgs(argv: string[]): LoginFlags {
  const flags: LoginFlags = {};
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--token":
        flags.token = argv[++i];
        break;
      case "--server":
        flags.server = argv[++i];
        break;
      case "--subdomain":
      case "-s":
        flags.subdomain = argv[++i];
        break;
      case "--port":
        flags.port = Number(argv[++i]);
        break;
      case "--help":
      case "-h":
        console.log(USAGE);
        process.exit(0);
        break;
      default:
        throw new Error(`unknown argument: ${argv[i]}\n${USAGE}`);
    }
  }
  return flags;
}

export async function runLogin(argv: string[]): Promise<void> {
  const flags = parseLoginArgs(argv);
  const existingAccount = await readConfig();
  const existingProject = await readProjectConfig();

  // non-interactive stdin (pipes/CI) can't drive clack prompts: fall back to
  // flags/saved values only, and fail loudly if something required is missing
  if (!process.stdin.isTTY) {
    const server = flags.server ?? existingAccount.server;
    const token = flags.token ?? existingAccount.token;
    if (!server || !token) {
      throw new Error(
        `non-interactive stdin: --token and --server are required (nothing saved to fall back to)\n${USAGE}`
      );
    }
    await writeConfig({ token, server });
    await updateProjectConfig({
      subdomain: flags.subdomain ?? existingProject.subdomain,
      port: flags.port ?? existingProject.port,
    });
    console.log(`[nonlocalhost] saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH}`);
    return;
  }

  p.intro("nonlocalhost login");

  let server = flags.server;
  if (!server) {
    const answer = await p.text({
      message: "Tunnel server host",
      placeholder: existingAccount.server,
      initialValue: existingAccount.server,
      validate: (value) => (!value ? "server host is required" : undefined),
    });
    if (p.isCancel(answer)) {
      p.cancel("취소됨");
      process.exit(1);
    }
    server = answer;
  }

  let token = flags.token;
  if (!token) {
    const hint = existingAccount.token ? ` (엔터: 기존 ${maskToken(existingAccount.token)} 유지)` : "";
    const answer = await p.password({
      message: `Auth token${hint}`,
      validate: (value) => (!value && !existingAccount.token ? "token is required" : undefined),
    });
    if (p.isCancel(answer)) {
      p.cancel("취소됨");
      process.exit(1);
    }
    token = answer || existingAccount.token;
  }
  if (!token) {
    throw new Error(`token is required\n${USAGE}`);
  }

  let subdomain = flags.subdomain;
  if (subdomain === undefined) {
    const answer = await p.text({
      message: "Subdomain (선택)",
      placeholder: existingProject.subdomain ?? "(none)",
      initialValue: existingProject.subdomain,
    });
    if (p.isCancel(answer)) {
      p.cancel("취소됨");
      process.exit(1);
    }
    subdomain = answer || existingProject.subdomain;
  }

  let port = flags.port;
  if (port === undefined) {
    const answer = await p.text({
      message: "Port (선택)",
      placeholder: existingProject.port ? String(existingProject.port) : "(none)",
      initialValue: existingProject.port ? String(existingProject.port) : undefined,
      validate: (value) => {
        if (!value) return undefined;
        const n = Number(value);
        return Number.isInteger(n) && n > 0 ? undefined : "숫자(포트)를 입력하세요";
      },
    });
    if (p.isCancel(answer)) {
      p.cancel("취소됨");
      process.exit(1);
    }
    port = answer ? Number(answer) : existingProject.port;
  }

  await writeConfig({ token, server });
  await updateProjectConfig({ subdomain, port });

  p.outro(
    `saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH}` +
      (subdomain || port ? `, project defaults to ${PROJECT_CONFIG_PATH}` : "")
  );
}
