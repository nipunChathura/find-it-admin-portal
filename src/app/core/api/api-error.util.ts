import { HttpErrorResponse } from '@angular/common/http';

/** API error body format (e.g. validation failure). */
export interface ApiErrorBody {
  status?: string;
  responseCode?: string;
  responseMessage?: string;
  fieldErrors?: Array<{ field: string; message: string; rejectedValue?: unknown }>;
}

/**
 * Extracts a user-friendly message from an API error response.
 * Handles format: { status, responseCode, responseMessage, fieldErrors }.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  const body = err.error as ApiErrorBody | null | undefined;
  if (!body || typeof body !== 'object') return fallback;

  const main = body.responseMessage?.trim();
  if (main) return main;

  const fieldErrors = body.fieldErrors;
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    const parts = fieldErrors.map((e) => `${e.field}: ${e.message || 'Invalid'}`);
    return parts.join('. ');
  }

  return fallback;
}
