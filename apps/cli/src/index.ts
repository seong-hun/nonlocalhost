#!/usr/bin/env bun
import { parseArgs, USAGE } from "./args";
import {
  CONFIG_PATH,
  PROJECT_CONFIG_PATH,
  maskToken,
  readConfig,
  readProjectConfig,
  writeConfig,
  writeProjectConfig,
} from "./config";
import { runLogin } from "./login";
import { runTunnel } from "./tunnel-client";

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (command === "login") {
    await runLogin(rest);
    return;
  }

  const args = parseArgs(process.argv.slice(2));
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

  const port = args.port ?? project.port;
  if (!port) {
    console.error(`[nonlocalhost] no port given and none saved in ${PROJECT_CONFIG_PATH}\n${USAGE}`);
    process.exit(1);
  }

  const subdomain = args.subdomain ?? project.subdomain;
  if (!subdomain) {
    console.error(
      `[nonlocalhost] --subdomain is required (none saved in ${PROJECT_CONFIG_PATH})\n${USAGE}`
    );
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
    console.log(`[nonlocalhost] saved port/subdomain to ${PROJECT_CONFIG_PATH}`);
  }

  await runTunnel({ server, token, subdomain, localHost, port, insecure });
}

main().catch((err) => {
  console.error(`[nonlocalhost] ${(err as Error).message}`);
  process.exit(1);
});
