import type { ErrorCode } from "./schemas/common.ts";

/**
 * Base class for expected failures raised by services.
 *
 * Services never touch HTTP: they throw one of these and the app's single
 * `onError` handler maps `code` to a status code and the shared error
 * envelope. That keeps transport concerns out of the business layer while
 * still producing typed, predictable responses for the RPC client.
 */
export class DomainError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

/** The requested resource does not exist. Maps to `404`. */
export class NotFoundError extends DomainError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message);
  }
}

/** The request conflicts with current state, e.g. a duplicate email. Maps to `409`. */
export class ConflictError extends DomainError {
  constructor(message = "Conflict") {
    super("CONFLICT", message);
  }
}
