#!/usr/bin/env bun
// @bun

// src/args.ts
var USAGE = `Usage:
  nonlocalhost <port> [--subdomain <name>] [options]
  nonlocalhost login [--token <token>] [--server <host>]

Options:
  -s, --subdomain <name>   public subdomain (reused from .nonlocalhost.json if omitted)
      --token <token>      auth token (falls back to NONLOCALHOST_TOKEN, then saved login)
      --server <host>      tunnel server host (falls back to NONLOCALHOST_SERVER, then saved login)
      --local-host <host>  host to forward to (default: localhost)
      --insecure           use ws/http instead of wss/https
      --save               remember port/subdomain in .nonlocalhost.json (and token/server via login)
  -h, --help               show this help`;
function parseArgs(argv) {
  const positional = [];
  let subdomain;
  let token;
  let server;
  let localHost;
  let insecure = false;
  let save = false;
  for (let i = 0;i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--subdomain":
      case "-s":
        subdomain = argv[++i];
        break;
      case "--token":
        token = argv[++i];
        break;
      case "--server":
        server = argv[++i];
        break;
      case "--local-host":
        localHost = argv[++i];
        break;
      case "--insecure":
        insecure = true;
        break;
      case "--save":
        save = true;
        break;
      case "--help":
      case "-h":
        console.log(USAGE);
        process.exit(0);
        break;
      default:
        positional.push(arg);
    }
  }
  let port;
  if (positional.length > 0) {
    port = Number(positional[0]);
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(`invalid port: ${positional[0]}
${USAGE}`);
    }
  }
  return { port, subdomain, token, server, localHost, insecure, save };
}

// src/config.ts
import { chmod } from "fs/promises";
import { homedir } from "os";
import { join, resolve } from "path";
var CONFIG_DIR = join(homedir(), ".config", "nonlocalhost");
var CONFIG_PATH = join(CONFIG_DIR, "config.json");
var PROJECT_CONFIG_PATH = resolve(".nonlocalhost.json");
async function readConfig() {
  const file = Bun.file(CONFIG_PATH);
  if (!await file.exists())
    return {};
  try {
    return await file.json();
  } catch {
    return {};
  }
}
async function writeConfig(config) {
  await Bun.write(CONFIG_PATH, `${JSON.stringify(config, null, 2)}
`);
  await chmod(CONFIG_PATH, 384);
}
async function readProjectConfig() {
  const file = Bun.file(PROJECT_CONFIG_PATH);
  if (!await file.exists())
    return {};
  try {
    return await file.json();
  } catch {
    return {};
  }
}
async function writeProjectConfig(config) {
  await Bun.write(PROJECT_CONFIG_PATH, `${JSON.stringify(config, null, 2)}
`);
}
function maskToken(token) {
  if (token.length <= 8)
    return "****";
  return `${token.slice(0, 7)}...${token.slice(-4)}`;
}

// src/prompt.ts
import * as readline from "readline";
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve2) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve2(answer.trim());
    });
  });
}
var KEY_CTRL_C = "\x03";
var KEY_CTRL_D = "\x04";
var KEY_BACKSPACE = "\x7F";
function promptHidden(question) {
  return new Promise((resolve2, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      prompt(question).then(resolve2, reject);
      return;
    }
    process.stdout.write(question);
    let value = "";
    const onData = (chunk) => {
      const char = chunk.toString("utf8");
      if (char === `
` || char === "\r" || char === KEY_CTRL_D) {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write(`
`);
        resolve2(value);
      } else if (char === KEY_CTRL_C) {
        process.stdout.write(`
`);
        process.exit(1);
      } else if (char === KEY_BACKSPACE || char === "\b") {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    stdin.resume();
    stdin.setRawMode(true);
    stdin.on("data", onData);
  });
}

// src/login.ts
var USAGE2 = "Usage: nonlocalhost login [--token <token>] [--server <host>]";
async function runLogin(argv) {
  let token;
  let server;
  for (let i = 0;i < argv.length; i++) {
    switch (argv[i]) {
      case "--token":
        token = argv[++i];
        break;
      case "--server":
        server = argv[++i];
        break;
      case "--help":
      case "-h":
        console.log(USAGE2);
        return;
      default:
        throw new Error(`unknown argument: ${argv[i]}
${USAGE2}`);
    }
  }
  const existing = await readConfig();
  if (!server) {
    const defaultHint = existing.server ? ` [${existing.server}]` : "";
    const answer = await prompt(`Server host${defaultHint}: `);
    server = answer || existing.server;
  }
  if (!server) {
    throw new Error(`server host is required
${USAGE2}`);
  }
  if (!token) {
    token = await promptHidden("Token (hidden): ");
  }
  if (!token) {
    throw new Error(`token is required
${USAGE2}`);
  }
  await writeConfig({ token, server });
  console.log(`[nonlocalhost] saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH} (0600)`);
}
// ../../packages/shared/src/tunnel-protocol.ts
function encodeFrame(header, body) {
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  const bodyBytes = body ?? new Uint8Array(0);
  const out = new Uint8Array(4 + headerBytes.length + bodyBytes.length);
  new DataView(out.buffer).setUint32(0, headerBytes.length, false);
  out.set(headerBytes, 4);
  out.set(bodyBytes, 4 + headerBytes.length);
  return out;
}
function decodeFrame(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerLen = view.getUint32(0, false);
  const headerBytes = bytes.subarray(4, 4 + headerLen);
  const body = bytes.subarray(4 + headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes));
  return { header, body };
}
var HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host"
]);
// src/colors.ts
var isTTY = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
function wrap(code) {
  return (text) => isTTY ? `\x1B[${code}m${text}\x1B[0m` : text;
}
var color = {
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  cyan: wrap(36),
  gray: wrap(90)
};
function statusColor(status) {
  if (status >= 500)
    return color.red;
  if (status >= 400)
    return color.yellow;
  if (status >= 300)
    return color.cyan;
  return color.green;
}

// src/tunnel-client.ts
var RECONNECT_BASE_MS = 1000;
var RECONNECT_MAX_MS = 30000;
var activeWs = null;
var shuttingDown = false;
function installShutdownHandler() {
  const shutdown = (signal) => {
    if (shuttingDown)
      return;
    shuttingDown = true;
    console.log(`
${color.gray(`[nonlocalhost] received ${signal}, shutting down...`)}`);
    activeWs?.close(1000, "client shutdown");
    process.exit(0);
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}
async function runTunnel(opts) {
  installShutdownHandler();
  let attempt = 0;
  for (;; ) {
    let result;
    try {
      result = await connectOnce(opts);
    } catch (err) {
      result = { welcomed: false };
      console.error(color.red(`[nonlocalhost] connection error: ${err.message}`));
    }
    if (result.fatal) {
      console.error(color.red(`[nonlocalhost] rejected: ${result.fatal}`));
      console.error(color.gray("[nonlocalhost] not retrying \u2014 fix this and run again."));
      process.exit(1);
    }
    attempt = result.welcomed ? 0 : attempt + 1;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt) + Math.random() * 500;
    console.log(color.yellow(`[nonlocalhost] reconnecting in ${Math.round(delay / 1000)}s...`));
    await Bun.sleep(delay);
  }
}
function wsUrl(opts) {
  const scheme = opts.insecure ? "ws" : "wss";
  return `${scheme}://${opts.server}/_ws/tunnel`;
}
function connectOnce(opts) {
  return new Promise((resolve2) => {
    const ws = new WebSocket(wsUrl(opts));
    ws.binaryType = "arraybuffer";
    let welcomed = false;
    let fatal;
    activeWs = ws;
    ws.addEventListener("open", () => {
      ws.send(encodeFrame({
        type: "hello",
        token: opts.token,
        subdomain: opts.subdomain
      }));
    });
    ws.addEventListener("message", (evt) => {
      const { header, body } = decodeFrame(evt.data);
      switch (header.type) {
        case "welcome":
          welcomed = true;
          printWelcome(opts, header.subdomain);
          break;
        case "error":
          fatal = header.message;
          console.error(color.red(`[nonlocalhost] server error: ${header.message}`));
          break;
        case "ping":
          ws.send(encodeFrame({ type: "pong" }));
          break;
        case "request":
          forwardRequest(ws, header, body, opts).catch((err) => console.error(color.red(`[nonlocalhost] request forwarding failed: ${err.message}`)));
          break;
      }
    });
    ws.addEventListener("close", (evt) => {
      if (activeWs === ws)
        activeWs = null;
      if (welcomed) {
        console.log(color.gray(`[nonlocalhost] disconnected (${evt.code}${evt.reason ? ` ${evt.reason}` : ""})`));
      }
      resolve2({ welcomed, fatal });
    });
    ws.addEventListener("error", () => {});
  });
}
async function forwardRequest(ws, header, body, opts) {
  const start = Date.now();
  const url = `http://${opts.localHost}:${opts.port}${header.path}${header.query}`;
  const hasBody = body.byteLength > 0 && header.method !== "GET" && header.method !== "HEAD";
  try {
    const res = await fetch(url, {
      method: header.method,
      headers: header.headers,
      body: hasBody ? body : undefined
    });
    const resHeaders = {};
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()))
        resHeaders[key] = value;
    });
    ws.send(encodeFrame({
      type: "response-head",
      id: header.id,
      status: res.status,
      headers: resHeaders
    }));
    if (res.body) {
      const reader = res.body.getReader();
      for (;; ) {
        const { value, done } = await reader.read();
        if (done)
          break;
        ws.send(encodeFrame({ type: "response-chunk", id: header.id }, value));
      }
    }
    ws.send(encodeFrame({ type: "response-end", id: header.id }));
    const statusText = statusColor(res.status)(String(res.status));
    console.log(`${header.method} ${header.path} ${statusText} ${Date.now() - start}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ws.send(encodeFrame({ type: "response-error", id: header.id, message }));
    console.log(`${header.method} ${header.path} ${color.red("ERR")} ${message}`);
  }
}
function printWelcome(opts, subdomain) {
  const scheme = opts.insecure ? "http" : "https";
  const publicUrl = `${scheme}://${subdomain}.${opts.server}`;
  const hmrHost = `${subdomain}.${opts.server}`;
  console.log(color.green(`[nonlocalhost] connected: ${publicUrl} -> http://${opts.localHost}:${opts.port}`));
  console.log(color.gray("[nonlocalhost] Vite \uC0AC\uC6A9 \uC2DC vite.config.ts\uC5D0 \uC544\uB798\uB97C \uCD94\uAC00\uD558\uC138\uC694:"));
  console.log(color.gray(`  server: { allowedHosts: ["${hmrHost}"], hmr: { host: "${hmrHost}", clientPort: 443 } }`));
}

// src/index.ts
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
    console.error("[nonlocalhost] no token found. Run `nonlocalhost login`, pass --token, or set NONLOCALHOST_TOKEN.");
    process.exit(1);
  }
  const server = args.server ?? process.env.NONLOCALHOST_SERVER ?? config.server;
  if (!server) {
    console.error("[nonlocalhost] no server configured. Run `nonlocalhost login`, pass --server, or set NONLOCALHOST_SERVER.");
    process.exit(1);
  }
  const port = args.port ?? project.port;
  if (!port) {
    console.error(`[nonlocalhost] no port given and none saved in ${PROJECT_CONFIG_PATH}
${USAGE}`);
    process.exit(1);
  }
  const subdomain = args.subdomain ?? project.subdomain;
  if (!subdomain) {
    console.error(`[nonlocalhost] --subdomain is required (none saved in ${PROJECT_CONFIG_PATH})
${USAGE}`);
    process.exit(1);
  }
  const localHost = args.localHost ?? project.localHost ?? "localhost";
  const insecure = args.insecure || (project.insecure ?? false);
  if (args.save) {
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
  console.error(`[nonlocalhost] ${err.message}`);
  process.exit(1);
});
