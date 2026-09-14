import type { components } from "./schema";

type ErrorBody = components["schemas"]["ErrorBody"];

/** ApiError carries the backend error code and field details. */
export class ApiError extends Error {
  readonly code: string;
  readonly details: components["schemas"]["FieldError"][] | undefined;

  constructor(error: ErrorBody) {
    super(error.message);
    this.name = "ApiError";
    this.code = error.code;
    this.details = error.details;
  }
}

type Envelope<T> = {
  data?: T;
  error?: ErrorBody;
};

/**
 * unwrap returns the envelope's data or throws the error message.
 * ApiError when the envelope carries a structured error body.
 */
export function unwrap<T>(env: Envelope<T>): T {
  if (env.error !== undefined) {
    throw new ApiError(env.error);
  }
  return env.data as T;
}
