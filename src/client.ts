import type { RunehandConfig } from './config.js';
import { RunehandApiError } from './errors.js';

interface ApiErrorEnvelope {
  error: { code: string; message: string; details: Record<string, unknown> | null };
}

export class RunehandApiClient {
  constructor(private readonly config: RunehandConfig) {}

  get<T>(path: string, query: Record<string, string | number | undefined> = {}): Promise<T> {
    return this.request<T>('GET', path, query);
  }

  post<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>('POST', path, undefined, body);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    query?: Record<string, string | number | undefined>,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(this.config.baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      throw new RunehandApiError('network_error', `Could not reach the Runehand API: ${message}`, 0);
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const envelope = payload as ApiErrorEnvelope | null;
      throw new RunehandApiError(
        envelope?.error?.code ?? 'unknown_error',
        envelope?.error?.message ?? `Request failed with status ${response.status}`,
        response.status,
        envelope?.error?.details ?? null
      );
    }

    return payload as T;
  }
}
