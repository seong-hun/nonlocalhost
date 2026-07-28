#!/usr/bin/env bun
import { parseArgs } from "./args";
import { CONFIG_PATH, readConfig, writeConfig } from "./config";
import { runTunnel } from "./tunnel-client";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await readConfig();

  const token = args.token ?? process.env.NONLOCALHOST_TOKEN ?? config.token;
  if (!token) {
    console.error(
      "[nonlocalhost] no token found. Pass --token, set NONLOCALHOST_TOKEN, or run once with --token --save."
    );
    process.exit(1);
  }

  const server = args.server ?? process.env.NONLOCALHOST_SERVER ?? config.server;
  if (!server) {
    console.error(
      "[nonlocalhost] no server configured. Pass --server, set NONLOCALHOST_SERVER, or run once with --server --save."
    );
    process.exit(1);
  }

  if (args.save) {
    await writeConfig({ token, server });
    console.log(`[nonlocalhost] saved token/server to ${CONFIG_PATH}`);
  }

  await runTunnel({
    server,
    token,
    subdomain: args.subdomain,
    localHost: args.localHost,
    port: args.port,
    insecure: args.insecure,
  });
}

main().catch((err) => {
  console.error(`[nonlocalhost] ${(err as Error).message}`);
  process.exit(1);
});
