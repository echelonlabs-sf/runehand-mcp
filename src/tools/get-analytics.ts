import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

const dateShape = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected format YYYY-MM-DD');

export function getAnalyticsTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'get_analytics',
    title: 'Get analytics dashboard',
    description: 'Get workspace KPIs and quick stats for a date range, same data as the in-app dashboard.',
    inputSchema: {
      from: dateShape.optional().describe('Range start (YYYY-MM-DD). Defaults to 30 days before "to".'),
      to: dateShape.optional().describe('Range end (YYYY-MM-DD). Defaults to today.'),
    },
    handler: async (args) => {
      try {
        const data = await client.get('/analytics/dashboard', {
          from: args.from as string | undefined,
          to: args.to as string | undefined,
        });
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
