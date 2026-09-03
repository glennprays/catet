import "server-only";

import type { components } from "./schema";

export type BackendFetchOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
};

type ErrorEnvelope = components["schemas"]["ErrorEnvelope"];

function backendBaseUrl() {
  const configuredUrl = process.env.CATET_BACKEND_URL;
  if (configuredUrl !== undefined && configuredUrl !== "") {
    return configuredUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("CATET_BACKEND_URL is required in production");
  }

  return "http://localhost:3000";
}

function backendUrl(path: string) {
  const base = backendBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function parseError(response: Response) {
  try {
    const envelope = (await response.json()) as ErrorEnvelope;
    if (envelope.error?.message !== undefined && envelope.error.message !== "") {
      return envelope.error.message;
    }
  } catch {
    // Fall through to the status-based message below.
  }

  return `Backend request failed: ${response.status}`;
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const init: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(backendUrl(path), init);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as T;
}
