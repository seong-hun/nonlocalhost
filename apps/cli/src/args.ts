export interface CliArgs {
  port?: number;
  subdomain?: string;
  token?: string;
  server?: string;
  localHost?: string;
  insecure: boolean;
  save: boolean;
}

const USAGE = `Usage:
  nonlocalhost [start] <port> [--subdomain <name>] [options]
  nonlocalhost [start] --port <n> [--subdomain <name>] [options]
  nonlocalhost login [--token <token>] [--server <host>] [--subdomain <name>] [--port <n>]

Options:
      --port <n>            port to expose (or pass it positionally, reused from saved project config if omitted)
  -s, --subdomain <name>   public subdomain (reused from saved project config if omitted)
      --token <token>      auth token (falls back to NONLOCALHOST_TOKEN, then saved login)
      --server <host>      tunnel server host (falls back to NONLOCALHOST_SERVER, then saved login)
      --local-host <host>  host to forward to (default: localhost)
      --insecure           use ws/http instead of wss/https
      --save               remember port/subdomain in the saved project config (and token/server via login)
  -h, --help               show this help`;

export { USAGE };

function parsePort(raw: string): number {
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`invalid port: ${raw}\n${USAGE}`);
  }
  return port;
}

export function parseArgs(argv: string[]): CliArgs {
  const positional: string[] = [];
  let portFlag: number | undefined;
  let subdomain: string | undefined;
  let token: string | undefined;
  let server: string | undefined;
  let localHost: string | undefined;
  let insecure = false;
  let save = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--port":
        portFlag = parsePort(argv[++i]);
        break;
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

  const port = positional.length > 0 ? parsePort(positional[0]) : portFlag;

  return { port, subdomain, token, server, localHost, insecure, save };
}
