import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../src/client.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const config = { apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' };

describe('RunehandApiClient', () => {
  it('sends the Bearer token on every request', async () => {
    let receivedAuth: string | null = null;
    server.use(
      http.get('https://api.test/api/v1/bots', ({ request }) => {
        receivedAuth = request.headers.get('Authorization');
        return HttpResponse.json({ data: [] });
      })
    );

    await new RunehandApiClient(config).get('/bots');

    expect(receivedAuth).toBe('Bearer rh_live_test');
  });

  it('serializes query params and skips undefined values', async () => {
    let receivedUrl = '';
    server.use(
      http.get('https://api.test/api/v1/conversations', ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );

    await new RunehandApiClient(config).get('/conversations', { status: 'active', bot_id: undefined });

    expect(receivedUrl).toContain('status=active');
    expect(receivedUrl).not.toContain('bot_id');
  });

  it('sends a POST body as JSON', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post('https://api.test/api/v1/leads', async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ data: { uuid: 'x' } }, { status: 201 });
      })
    );

    await new RunehandApiClient(config).post('/leads', { bot_id: 'abc', name: 'Ana' });

    expect(receivedBody).toEqual({ bot_id: 'abc', name: 'Ana' });
  });

  it('throws RunehandApiError with the envelope fields on a non-2xx response', async () => {
    server.use(
      http.get('https://api.test/api/v1/bots', () =>
        HttpResponse.json(
          {
            error: {
              code: 'plan_upgrade_required',
              message: 'Your current plan does not include API access.',
              details: { required_tiers: ['pro', 'enterprise'] },
            },
          },
          { status: 403 }
        )
      )
    );

    await expect(new RunehandApiClient(config).get('/bots')).rejects.toMatchObject({
      code: 'plan_upgrade_required',
      message: 'Your current plan does not include API access.',
      status: 403,
      details: { required_tiers: ['pro', 'enterprise'] },
    });
  });

  it('throws a network_error RunehandApiError when the request itself fails', async () => {
    server.use(http.get('https://api.test/api/v1/bots', () => HttpResponse.error()));

    await expect(new RunehandApiClient(config).get('/bots')).rejects.toMatchObject({
      code: 'network_error',
    });
  });
});
