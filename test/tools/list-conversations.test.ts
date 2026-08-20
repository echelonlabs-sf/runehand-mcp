import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { listConversationsTool } from '../../src/tools/list-conversations.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('list_conversations tool', () => {
  it('forwards bot_id and status as query params', async () => {
    let receivedUrl = '';
    server.use(
      http.get('https://api.test/api/v1/conversations', ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );

    await listConversationsTool(client).handler({ bot_id: 'b1', status: 'active' });

    expect(receivedUrl).toContain('bot_id=b1');
    expect(receivedUrl).toContain('status=active');
  });

  it('returns an isError result on a rate_limited (429) response', async () => {
    server.use(
      http.get('https://api.test/api/v1/conversations', () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Too many requests.', details: null } },
          { status: 429 }
        )
      )
    );

    const result = await listConversationsTool(client).handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('rate_limited: Too many requests.');
  });
});
