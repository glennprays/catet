import "server-only";

import type { components } from "./schema";

export type BackendFetchOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  /** Go session JWT attached as Authorization: Bearer when present. */
  token?: string;
};

type ErrorEnvelope = components["schemas"]["ErrorEnvelope"];

export type BackendEnvelope = {
  data?: unknown;
  error?: ErrorEnvelope["error"];
  trace_id: string;
};

export type BackendResult = {
  status: number;
  envelope: BackendEnvelope;
};

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

/**
 * backendRequest forwards the request to the Go API and returns the
 * parsed envelope with its original status — the BFF layer uses this
 * to pass errors through untouched.
 */
export async function backendRequest(
  path: string,
  options: BackendFetchOptions = {},
): Promise<BackendResult> {
  const headers = new Headers(options.headers);
  const init: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.token !== undefined && options.token !== "") {
    headers.set("authorization", `Bearer ${options.token}`);
  }

  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(backendUrl(path), init);

  if (!response.ok) {
    // Read the body once: derive the message and the structured
    // error from the same JSON payload.
    let error: ErrorEnvelope["error"] | undefined;
    let message = `Backend request failed: ${response.status}`;
    try {
      const body = (await response.json()) as ErrorEnvelope;
      error = body.error;
      if (error?.message !== undefined && error.message !== "") {
        message = error.message;
      }
    } catch {
      error = undefined;
    }
    if (error === undefined) {
      error = { code: "INTERNAL", message };
    }
    return {
      status: response.status,
      envelope: { error, trace_id: "" },
    };
  }

  const envelope = (await response.json()) as BackendEnvelope;
  return { status: response.status, envelope };
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const { status, envelope } = await backendRequest(path, options);
  if (status >= 300 || envelope.error !== undefined) {
    throw new Error(envelope.error?.message ?? `Backend request failed: ${status}`);
  }

  return envelope as T;
}
