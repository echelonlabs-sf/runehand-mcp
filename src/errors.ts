export type RunehandApiErrorDetails = Record<string, unknown> | null;

export class RunehandApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: RunehandApiErrorDetails;

  constructor(code: string, message: string, status: number, details: RunehandApiErrorDetails = null) {
    super(message);
    this.name = 'RunehandApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
