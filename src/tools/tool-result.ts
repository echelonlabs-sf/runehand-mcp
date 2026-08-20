import { RunehandApiError } from '../errors.js';
import type { ToolResult } from './types.js';

export function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(error: unknown): ToolResult {
  if (error instanceof RunehandApiError) {
    return { isError: true, content: [{ type: 'text', text: `${error.code}: ${error.message}` }] };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { isError: true, content: [{ type: 'text', text: `unknown_error: ${message}` }] };
}
