const isTTY = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function wrap(code: number): (text: string) => string {
  return (text) => (isTTY ? `[${code}m${text}[0m` : text);
}

export const color = {
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  cyan: wrap(36),
  gray: wrap(90),
};

export function statusColor(status: number): (text: string) => string {
  if (status >= 500) return color.red;
  if (status >= 400) return color.yellow;
  if (status >= 300) return color.cyan;
  return color.green;
}
