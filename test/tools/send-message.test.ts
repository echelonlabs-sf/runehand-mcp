import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { sendMessageTool } from '../../src/tools/send-message.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('send_message tool', () => {
  it('posts content to /conversations/{id}/messages', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post('https://api.test/api/v1/conversations/:id/messages', async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ data: { uuid: 'm1', content: 'hello' } }, { status: 201 });
      })
    );

    const result = await sendMessageTool(client).handler({ conversation_id: 'c1', content: 'hello' });

    expect(receivedBody).toEqual({ content: 'hello' });
    expect(result.isError).toBeUndefined();
  });

  it('returns an isError result on 404 (conversation not found or not owned)', async () => {
    server.use(
      http.post('https://api.test/api/v1/conversations/:id/messages', () =>
        HttpResponse.json({ error: { code: 'not_found', message: 'Not found.', details: null } }, { status: 404 })
      )
    );

    const result = await sendMessageTool(client).handler({ conversation_id: 'missing', content: 'hello' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('not_found: Not found.');
  });
});
