import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function listBotsTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'list_bots',
    title: 'List bots',
    description: 'List the bots that belong to the workspace that owns the API key.',
    inputSchema: {
      page: z.number().int().positive().optional(),
      per_page: z.number().int().positive().max(100).optional(),
    },
    handler: async (args) => {
      try {
        const data = await client.get('/bots', {
          page: args.page as number | undefined,
          per_page: args.per_page as number | undefined,
        });
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
