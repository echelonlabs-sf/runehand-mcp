import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { createLeadTool } from '../../src/tools/create-lead.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('create_lead tool', () => {
  it('posts the lead fields to /leads', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post('https://api.test/api/v1/leads', async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ data: { uuid: 'l1', name: 'Ana', status: 'new' } }, { status: 201 });
      })
    );

    const result = await createLeadTool(client).handler({ bot_id: 'b1', name: 'Ana', email: 'ana@example.com' });

    expect(receivedBody).toMatchObject({ bot_id: 'b1', name: 'Ana', email: 'ana@example.com' });
    expect(result.isError).toBeUndefined();
  });

  it('returns an isError result on a 422 (bot_id from another workspace or invalid)', async () => {
    server.use(
      http.post('https://api.test/api/v1/leads', () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_failed',
              message: 'The selected bot_id is invalid.',
              details: { bot_id: ['The selected bot_id is invalid.'] },
            },
          },
          { status: 422 }
        )
      )
    );

    const result = await createLeadTool(client).handler({ bot_id: 'other-workspace-bot' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('validation_failed: The selected bot_id is invalid.');
  });
});
