import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { listFlowsTool } from '../../src/tools/list-flows.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('list_flows tool', () => {
  it('requests /bots/{bot_id}/flows with the given bot_id', async () => {
    let requestedPath = '';
    server.use(
      http.get('https://api.test/api/v1/bots/:botId/flows', ({ params }) => {
        requestedPath = `/bots/${params.botId}/flows`;
        return HttpResponse.json({ data: [] });
      })
    );

    await listFlowsTool(client).handler({ bot_id: '3f2a1c9e-0000-0000-0000-000000000000' });

    expect(requestedPath).toBe('/bots/3f2a1c9e-0000-0000-0000-000000000000/flows');
  });

  it('returns an isError result on a 404 (bot not found or not owned by this workspace)', async () => {
    server.use(
      http.get('https://api.test/api/v1/bots/:botId/flows', () =>
        HttpResponse.json({ error: { code: 'not_found', message: 'Not found.', details: null } }, { status: 404 })
      )
    );

    const result = await listFlowsTool(client).handler({ bot_id: '3f2a1c9e-0000-0000-0000-000000000000' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('not_found: Not found.');
  });
});
