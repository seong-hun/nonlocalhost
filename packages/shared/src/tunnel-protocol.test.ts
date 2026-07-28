import { describe, expect, test } from "bun:test";
import { decodeFrame, encodeFrame, type RequestFrame } from "./tunnel-protocol";

describe("tunnel-protocol framing", () => {
  test("round-trips a header without a body", () => {
    const header: RequestFrame = {
      type: "request",
      id: "abc",
      method: "GET",
      path: "/foo",
      query: "",
      headers: { accept: "text/html" },
    };

    const encoded = encodeFrame(header);
    const { header: decoded, body } = decodeFrame<RequestFrame>(encoded);

    expect(decoded).toEqual(header);
    expect(body.byteLength).toBe(0);
  });

  test("round-trips a header with a binary body", () => {
    const header = { type: "response-chunk", id: "xyz" };
    const body = new Uint8Array([0, 255, 1, 254, 128]);

    const encoded = encodeFrame(header, body);
    const { header: decoded, body: decodedBody } = decodeFrame<typeof header>(encoded);

    expect(decoded).toEqual(header);
    expect([...decodedBody]).toEqual([...body]);
  });
});
