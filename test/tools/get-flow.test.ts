import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { getFlowTool } from '../../src/tools/get-flow.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('get_flow tool', () => {
  it('returns the flow with its nodes', async () => {
    server.use(
      http.get('https://api.test/api/v1/flows/:id', () =>
        HttpResponse.json({ data: { uuid: 'f1', name: 'Principal', nodes: { n1: { type: 'start' } } } })
      )
    );

    const result = await getFlowTool(client).handler({ flow_id: 'f1' });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('"type": "start"');
  });

  it('returns an isError result on 404', async () => {
    server.use(
      http.get('https://api.test/api/v1/flows/:id', () =>
        HttpResponse.json({ error: { code: 'not_found', message: 'Not found.', details: null } }, { status: 404 })
      )
    );

    const result = await getFlowTool(client).handler({ flow_id: 'missing' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('not_found: Not found.');
  });
});
