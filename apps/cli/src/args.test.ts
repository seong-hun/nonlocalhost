import { describe, expect, test } from "bun:test";
import { parseArgs } from "./args";

describe("parseArgs", () => {
  test("parses port and subdomain", () => {
    const args = parseArgs(["5173", "--subdomain", "myapp"]);
    expect(args.port).toBe(5173);
    expect(args.subdomain).toBe("myapp");
    expect(args.localHost).toBe("localhost");
    expect(args.insecure).toBe(false);
  });

  test("parses optional flags", () => {
    const args = parseArgs([
      "3000",
      "-s",
      "api",
      "--token",
      "nlh_abc",
      "--server",
      "example.com",
      "--local-host",
      "127.0.0.1",
      "--insecure",
      "--save",
    ]);
    expect(args).toEqual({
      port: 3000,
      subdomain: "api",
      token: "nlh_abc",
      server: "example.com",
      localHost: "127.0.0.1",
      insecure: true,
      save: true,
    });
  });

  test("throws when subdomain is missing", () => {
    expect(() => parseArgs(["3000"])).toThrow();
  });

  test("throws when port is not a number", () => {
    expect(() => parseArgs(["abc", "--subdomain", "myapp"])).toThrow();
  });
});
