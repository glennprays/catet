import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import type { components } from "@/lib/api/schema";

vi.mock("server-only", () => ({}));


import { GET } from "./route";

const originalBackendUrl = process.env.CATET_BACKEND_URL;

type HealthEnvelope = components["schemas"]["HealthEnvelope"];

async function startHealthBackend(envelope: HealthEnvelope) {
  const server = createServer((req, res) => {
    expect(req.url).toBe("/api/v1/health");
    expect(req.method).toBe("GET");
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

describe("GET /api/health", () => {
  beforeEach(() => {
    delete process.env.CATET_BACKEND_URL;
  });

  afterEach(() => {
    if (originalBackendUrl === undefined) {
      delete process.env.CATET_BACKEND_URL;
    } else {
      process.env.CATET_BACKEND_URL = originalBackendUrl;
    }
  });

  test("returns the backend health envelope unchanged", async () => {
    const envelope = {
      data: { status: "ok", timestamp: "2026-09-03T10:29:28Z" },
      trace_id: "51c35336-cc71-436d-a8dc-125cee88b156",
    } satisfies HealthEnvelope;
    const server = await startHealthBackend(envelope);
    process.env.CATET_BACKEND_URL = server.baseUrl;

    try {
      const response = await GET();

      await expect(response.json()).resolves.toEqual(envelope);
    } finally {
      await server.close();
    }
  });
});
