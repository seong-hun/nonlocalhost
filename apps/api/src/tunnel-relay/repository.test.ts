import { describe, expect, test } from "bun:test";
import { isValidSubdomain } from "./repository";

describe("isValidSubdomain", () => {
  test("accepts simple DNS labels", () => {
    expect(isValidSubdomain("myapp")).toBe(true);
    expect(isValidSubdomain("my-app-2")).toBe(true);
  });

  test("rejects labels with dots, spaces, or special characters", () => {
    expect(isValidSubdomain("my.app")).toBe(false);
    expect(isValidSubdomain("my app")).toBe(false);
    expect(isValidSubdomain("<script>")).toBe(false);
    expect(isValidSubdomain("-leading-hyphen")).toBe(false);
    expect(isValidSubdomain("trailing-hyphen-")).toBe(false);
    expect(isValidSubdomain("")).toBe(false);
  });
});
