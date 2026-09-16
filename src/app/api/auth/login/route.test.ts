import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";
import type { components } from "@/lib/api/schema";

vi.mock("server-only", () => ({}));

// The route sets the cookie through next/headers, which only exists
// inside a Next request scope. The stand-in is Next's own cookie
// writer over a Headers bag the test owns, so the assertions below
// read the real serialized set-cookie.
const { sink } = vi.hoisted(() => ({ sink: new Headers() }));

vi.mock("next/headers", () => ({ cookies: async () => new ResponseCookies(sink) }));

import { POST } from "./route";

const originalBackendUrl = process.env.CATET_BACKEND_URL;

type SessionEnvelope = components["schemas"]["SessionEnvelope"];

async function startLoginBackend(envelope: SessionEnvelope) {
  const server = createServer((req, res) => {
    expect(req.url).toBe("/api/v1/auth/login");
    expect(req.method).toBe("POST");
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(envelope));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("test server did not bind to a TCP port");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    sink.delete("set-cookie");
    delete process.env.CATET_BACKEND_URL;
  });

  afterEach(() => {
    if (originalBackendUrl === undefined) {
      delete process.env.CATET_BACKEND_URL;
    } else {
      process.env.CATET_BACKEND_URL = originalBackendUrl;
    }
  });

  test("stores the JWT in the httpOnly cookie and strips it from the body", async () => {
    const envelope = {
      data: { token: "jwt-1", expires_at: "2026-10-16T10:29:28Z" },
      trace_id: "51c35336-cc71-436d-a8dc-125cee88b156",
    } satisfies SessionEnvelope;
    const server = await startLoginBackend(envelope);
    process.env.CATET_BACKEND_URL = server.baseUrl;

    try {
      const response = await POST(
        new Request("http://localhost:3001/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ phone: "+628123456789", password: "correct horse" }),
        }),
      );

      const body = (await response.json()) as { data: Record<string, unknown> };
      expect(body.data).toEqual({ expires_at: "2026-10-16T10:29:28Z" });
      expect(body.data).not.toHaveProperty("token");
      expect(JSON.stringify(body)).not.toContain("jwt-1");

      const setCookie = sink.get("set-cookie") ?? "";
      expect(setCookie).toContain("catet_session=jwt-1");
      expect(setCookie).toContain("HttpOnly");
    } finally {
      await server.close();
    }
  });
});
