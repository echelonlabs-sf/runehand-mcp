import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { getConversationTool } from '../../src/tools/get-conversation.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('get_conversation tool', () => {
  it('returns the conversation with its messages', async () => {
    server.use(
      http.get('https://api.test/api/v1/conversations/:id', () =>
        HttpResponse.json({ data: { uuid: 'c1', messages: [{ uuid: 'm1', content: 'hi' }] } })
      )
    );

    const result = await getConversationTool(client).handler({ conversation_id: 'c1' });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('"content": "hi"');
  });

  it('returns an isError result on 404', async () => {
    server.use(
      http.get('https://api.test/api/v1/conversations/:id', () =>
        HttpResponse.json({ error: { code: 'not_found', message: 'Not found.', details: null } }, { status: 404 })
      )
    );

    const result = await getConversationTool(client).handler({ conversation_id: 'missing' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('not_found: Not found.');
  });
});
