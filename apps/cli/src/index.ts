#!/usr/bin/env bun
import * as p from "@clack/prompts";
import { parseArgs, USAGE } from "./args";
import {
  CONFIG_PATH,
  maskToken,
  projectConfigLocation,
  readConfig,
  readProjectConfig,
  updateProjectConfig,
  writeConfig,
  writeProjectConfig,
} from "./config";
import { runLogin } from "./login";
import { runTunnel } from "./tunnel-client";

function parsePortAnswer(value: string): string | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? undefined : "숫자(포트)를 입력하세요";
}

// interactively fills in whatever port/subdomain is still missing and saves
// it right away, so the next run in this directory needs no flags at all
async function promptForMissing(port: number | undefined, subdomain: string | undefined) {
  p.intro("nonlocalhost");

  if (!port) {
    const answer = await p.text({ message: "Port to expose", validate: parsePortAnswer });
    if (p.isCancel(answer)) {
      p.cancel("취소됨");
      process.exit(1);
    }
    port = Number(answer);
  }

  if (!subdomain) {
    const answer = await p.text({
      message: "Public subdomain",
      validate: (value) => (!value ? "subdomain is required" : undefined),
    });
    if (p.isCancel(answer)) {
      p.cancel("취소됨");
      process.exit(1);
    }
    subdomain = answer;
  }

  await updateProjectConfig({ port, subdomain });
  p.outro(`saved to ${projectConfigLocation()}`);
  return { port, subdomain };
}

async function main() {
  const argv = process.argv.slice(2);
  const [command, ...rest] = argv;

  if (command === "login") {
    await runLogin(rest);
    return;
  }

  // "start" is an optional, explicit alias for the default (positional-port) form
  const args = parseArgs(command === "start" ? rest : argv);
  const config = await readConfig();
  const project = await readProjectConfig();

  const token = args.token ?? process.env.NONLOCALHOST_TOKEN ?? config.token;
  if (!token) {
    console.error(
      "[nonlocalhost] no token found. Run `nonlocalhost login`, pass --token, or set NONLOCALHOST_TOKEN."
    );
    process.exit(1);
  }

  const server = args.server ?? process.env.NONLOCALHOST_SERVER ?? config.server;
  if (!server) {
    console.error(
      "[nonlocalhost] no server configured. Run `nonlocalhost login`, pass --server, or set NONLOCALHOST_SERVER."
    );
    process.exit(1);
  }

  let port = args.port ?? project.port;
  let subdomain = args.subdomain ?? project.subdomain;

  if ((!port || !subdomain) && process.stdin.isTTY) {
    ({ port, subdomain } = await promptForMissing(port, subdomain));
  }

  if (!port) {
    console.error(`[nonlocalhost] no port given and none saved\n${USAGE}`);
    process.exit(1);
  }

  if (!subdomain) {
    console.error(`[nonlocalhost] --subdomain is required (none saved)\n${USAGE}`);
    process.exit(1);
  }

  const localHost = args.localHost ?? project.localHost ?? "localhost";
  const insecure = args.insecure || (project.insecure ?? false);

  if (args.save) {
    // token/server already come from a saved login; only the account credentials
    // that arrived via this invocation's flags get persisted alongside them
    if (args.token || args.server) {
      await writeConfig({ token, server });
      console.log(`[nonlocalhost] saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH}`);
    }
    await writeProjectConfig({ port, subdomain, localHost, insecure });
    console.log(`[nonlocalhost] saved port/subdomain to ${projectConfigLocation()}`);
  }

  await runTunnel({ server, token, subdomain, localHost, port, insecure });
}

main().catch((err) => {
  console.error(`[nonlocalhost] ${(err as Error).message}`);
  process.exit(1);
});
