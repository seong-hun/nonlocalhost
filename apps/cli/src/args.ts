export interface CliArgs {
  port: number;
  subdomain: string;
  token?: string;
  server?: string;
  localHost: string;
  insecure: boolean;
  save: boolean;
}

const USAGE =
  "Usage: nonlocalhost <port> --subdomain <name> [--token <token>] [--server <host>] [--save]";

export function parseArgs(argv: string[]): CliArgs {
  const positional: string[] = [];
  let subdomain: string | undefined;
  let token: string | undefined;
  let server: string | undefined;
  let localHost = "localhost";
  let insecure = false;
  let save = false;

  for (let i = 0; i < argv.length; i++) {
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

  const port = Number(positional[0]);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(USAGE);
  }
  if (!subdomain) {
    throw new Error(`--subdomain <name> is required\n${USAGE}`);
  }

  return { port, subdomain, token, server, localHost, insecure, save };
}
