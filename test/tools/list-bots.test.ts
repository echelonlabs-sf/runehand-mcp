import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { listBotsTool } from '../../src/tools/list-bots.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('list_bots tool', () => {
  it('returns the bots list as JSON text content', async () => {
    server.use(
      http.get('https://api.test/api/v1/bots', () => HttpResponse.json({ data: [{ uuid: 'b1', name: 'Bot 1' }] }))
    );

    const result = await listBotsTool(client).handler({});

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('"name": "Bot 1"');
  });

  it('returns an isError result with the API error code and message on failure', async () => {
    server.use(
      http.get('https://api.test/api/v1/bots', () =>
        HttpResponse.json(
          { error: { code: 'plan_upgrade_required', message: 'Upgrade required.', details: null } },
          { status: 403 }
        )
      )
    );

    const result = await listBotsTool(client).handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('plan_upgrade_required: Upgrade required.');
  });
});
