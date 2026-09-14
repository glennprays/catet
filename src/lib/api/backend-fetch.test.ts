import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";
import type { components } from "./schema";

vi.mock("server-only", () => ({}));


import { backendFetch } from "./backend-fetch";

const originalBackendUrl = process.env.CATET_BACKEND_URL;

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
type HealthEnvelope = components["schemas"]["HealthEnvelope"];


async function withServer(handler: Handler) {
  const server = createServer(handler);
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

describe("backendFetch", () => {
  beforeEach(() => {
    delete process.env.CATET_BACKEND_URL;
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    if (originalBackendUrl === undefined) {
      delete process.env.CATET_BACKEND_URL;
    } else {
      process.env.CATET_BACKEND_URL = originalBackendUrl;
    }
    vi.unstubAllEnvs();
  });

  test("uses the configured backend URL and sends JSON bodies", async () => {
    const server = await withServer((req, res) => {
      expect(req.url).toBe("/api/v1/health");
      expect(req.method).toBe("POST");
      expect(req.headers["content-type"]).toBe("application/json");

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        expect(JSON.parse(body)).toEqual({ probe: true });
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ data: { status: "ok" }, trace_id: "trace-1" }));
      });
    });
    process.env.CATET_BACKEND_URL = server.baseUrl;

    try {
      await expect(
        backendFetch<HealthEnvelope>("/api/v1/health", {
          method: "POST",
          body: { probe: true },
        }),
      ).resolves.toEqual({ data: { status: "ok" }, trace_id: "trace-1" });
    } finally {
      await server.close();
    }
  });

  test("throws the backend envelope error message on non-2xx responses", async () => {
    const server = await withServer((_req, res) => {
      res.statusCode = 400;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: { code: "BAD_REQUEST", message: "invalid probe" }, trace_id: "trace-2" }));
    });
    process.env.CATET_BACKEND_URL = server.baseUrl;

    try {
      await expect(backendFetch("/api/v1/health")).rejects.toThrow("invalid probe");
    } finally {
      await server.close();
    }
  });

  test("attaches the bearer token when one is provided", async () => {
    const server = await withServer((req, res) => {
      expect(req.headers.authorization).toBe("Bearer jwt-abc");
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ data: { ok: true }, trace_id: "t" }));
    });
    process.env.CATET_BACKEND_URL = server.baseUrl;

    try {
      await expect(backendFetch("/api/v1/sources", { token: "jwt-abc" })).resolves.toEqual({
        data: { ok: true },
        trace_id: "t",
      });
    } finally {
      await server.close();
    }
  });

  test("omits the authorization header without a token", async () => {
    const server = await withServer((req, res) => {
      expect(req.headers.authorization).toBeUndefined();
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ data: { ok: true }, trace_id: "t" }));
    });
    process.env.CATET_BACKEND_URL = server.baseUrl;

    try {
      await expect(backendFetch("/api/v1/sources")).resolves.toEqual({
        data: { ok: true },
        trace_id: "t",
      });
    } finally {
      await server.close();
    }
  });

  test("requires CATET_BACKEND_URL in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(backendFetch("/api/v1/health")).rejects.toThrow(
      "CATET_BACKEND_URL is required in production",
    );
  });
});
