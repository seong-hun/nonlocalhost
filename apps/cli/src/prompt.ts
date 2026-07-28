import * as readline from "node:readline";

export function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const KEY_CTRL_C = "\u0003";
const KEY_CTRL_D = "\u0004";
const KEY_BACKSPACE = "\u007f";

export function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      // non-interactive stdin (pipes/CI): fall back to a plain prompt
      prompt(question).then(resolve, reject);
      return;
    }

    process.stdout.write(question);
    let value = "";

    const onData = (chunk: Buffer) => {
      const char = chunk.toString("utf8");
      if (char === "\n" || char === "\r" || char === KEY_CTRL_D) {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (char === KEY_CTRL_C) {
        process.stdout.write("\n");
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
