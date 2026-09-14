import { ApiError, unwrap } from "./unwrap";

type Envelope<T> = {
  data?: T;
  error?: { code: string; message: string; details?: { field: string; message: string }[] };
  trace_id?: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

function rawFetch<T>(
  path: string,
  init: RequestOptions,
): Promise<Envelope<T> & { trace_id: string }> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  return fetch(`/api${path}`, {
    method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: init.signal,
  }).then(
    (response) => response.json() as Promise<Envelope<T> & { trace_id: string }>,
    () => {
      throw new ApiError({ code: "INTERNAL", message: "Request failed: network error" });
    },
  );
}

/**
 * Browser-side API access: same-origin fetch to the Next.js BFF.
 * apiFetch unwraps `data` and throws ApiError carrying the backend
 * code and field details on error envelopes.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestOptions = {},
): Promise<T> {
  const envelope = await rawFetch<T>(path, init);
  return unwrap<T>(envelope);
}

/**
 * apiFetchEnvelope returns the FULL envelope — for callers that need
 * pagination meta (`page`) alongside the payload. The caller supplies
 * the complete envelope type.
 */
export function apiFetchEnvelope<E>(path: string, init: RequestOptions = {}): Promise<E> {
  return rawFetch<never>(path, init) as unknown as Promise<E>;
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(path, { signal });
}

export function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(path, { method, body });
}

export { ApiError };
