import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { RunehandApiClient } from '../../src/client.js';
import { getAnalyticsTool } from '../../src/tools/get-analytics.js';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });

describe('get_analytics tool', () => {
  it('forwards from/to as query params', async () => {
    let receivedUrl = '';
    server.use(
      http.get('https://api.test/api/v1/analytics/dashboard', ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ data: { kpis: {}, quick_stats: {}, range: { from: '2026-07-01', to: '2026-07-31' } } });
      })
    );

    await getAnalyticsTool(client).handler({ from: '2026-07-01', to: '2026-07-31' });

    expect(receivedUrl).toContain('from=2026-07-01');
    expect(receivedUrl).toContain('to=2026-07-31');
  });

  it('returns an isError result on a 422 (not a real calendar date)', async () => {
    server.use(
      http.get('https://api.test/api/v1/analytics/dashboard', () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_failed',
              message: 'The from field must be a valid date.',
              details: { from: ['The from field must be a valid date.'] },
            },
          },
          { status: 422 }
        )
      )
    );

    const result = await getAnalyticsTool(client).handler({ from: '2026-13-45' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('validation_failed: The from field must be a valid date.');
  });
});
