import { describe, it, expect } from 'vitest';
import { ok, errorResult } from '../../src/tools/tool-result.js';
import { RunehandApiError } from '../../src/errors.js';

describe('ok', () => {
  it('wraps data as pretty-printed JSON text content', () => {
    expect(ok({ foo: 'bar' })).toEqual({
      content: [{ type: 'text', text: JSON.stringify({ foo: 'bar' }, null, 2) }],
    });
  });
});

describe('errorResult', () => {
  it('formats a RunehandApiError as "code: message"', () => {
    const error = new RunehandApiError('not_found', 'Resource not found.', 404);
    expect(errorResult(error)).toEqual({
      isError: true,
      content: [{ type: 'text', text: 'not_found: Resource not found.' }],
    });
  });

  it('formats an unexpected Error as unknown_error', () => {
    expect(errorResult(new Error('boom'))).toEqual({
      isError: true,
      content: [{ type: 'text', text: 'unknown_error: boom' }],
    });
  });

  it('formats a non-Error throw as unknown_error via String()', () => {
    expect(errorResult('plain string throw')).toEqual({
      isError: true,
      content: [{ type: 'text', text: 'unknown_error: plain string throw' }],
    });
  });
});
