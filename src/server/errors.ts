import "server-only";

/**
 * Error with a stable machine code and a message that is safe to show to users.
 * Never put database details, SQL text or secrets in `message`.
 */
export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type AppErrorCode =
  | "UNAUTHENTICATED"
  | "NOT_VERIFIED"
  | "VALIDATION_FAILED"
  | "ALREADY_IN_WORKSPACE"
  | "NO_WORKSPACE"
  | "WORKSPACE_FULL"
  | "INVITE_INVALID"
  | "INVITE_EXPIRED"
  | "INVITE_USED"
  | "INVITE_OWN"
  | "ONBOARDING_INCOMPLETE"
  | "INSUFFICIENT_CREDITS"
  | "PLAN_LIMIT"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL";

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
