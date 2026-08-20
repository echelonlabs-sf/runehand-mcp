import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { listLeadsTool } from '../../src/tools/list-leads.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('list_leads tool', () => {
  it('forwards status as a query param', async () => {
    let receivedUrl = '';
    server.use(
      http.get('https://api.test/api/v1/leads', ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );

    await listLeadsTool(client).handler({ status: 'qualified' });

    expect(receivedUrl).toContain('status=qualified');
  });

  it('returns an isError result on 401 (invalid or revoked key)', async () => {
    server.use(
      http.get('https://api.test/api/v1/leads', () =>
        HttpResponse.json({ error: { code: 'unauthenticated', message: 'Invalid API key.', details: null } }, { status: 401 })
      )
    );

    const result = await listLeadsTool(client).handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('unauthenticated: Invalid API key.');
  });
});
