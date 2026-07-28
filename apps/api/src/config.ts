const domain = process.env.PUBLIC_BASE_DOMAIN;
if (!domain) {
  throw new Error("PUBLIC_BASE_DOMAIN is not set (e.g. tunnel.example.com)");
}

export const BASE_DOMAIN = domain;
