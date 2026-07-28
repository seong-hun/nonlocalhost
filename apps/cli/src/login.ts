import { CONFIG_PATH, maskToken, readConfig, writeConfig } from "./config";
import { prompt, promptHidden } from "./prompt";

const USAGE = "Usage: nonlocalhost login [--token <token>] [--server <host>]";

export async function runLogin(argv: string[]): Promise<void> {
  let token: string | undefined;
  let server: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--token":
        token = argv[++i];
        break;
      case "--server":
        server = argv[++i];
        break;
      case "--help":
      case "-h":
        console.log(USAGE);
        return;
      default:
        throw new Error(`unknown argument: ${argv[i]}\n${USAGE}`);
    }
  }

  const existing = await readConfig();

  if (!server) {
    const defaultHint = existing.server ? ` [${existing.server}]` : "";
    const answer = await prompt(`Server host${defaultHint}: `);
    server = answer || existing.server;
  }
  if (!server) {
    throw new Error(`server host is required\n${USAGE}`);
  }

  if (!token) {
    // hidden input: never echoed, never left in shell history
    token = await promptHidden("Token (hidden): ");
  }
  if (!token) {
    throw new Error(`token is required\n${USAGE}`);
  }

  await writeConfig({ token, server });
  console.log(`[nonlocalhost] saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH} (0600)`);
}
