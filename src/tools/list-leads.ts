import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function listLeadsTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'list_leads',
    title: 'List leads',
    description: 'List leads for the workspace, optionally filtered by bot_id and/or status.',
    inputSchema: {
      bot_id: z.string().uuid().optional().describe('Filter by bot UUID.'),
      status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
      page: z.number().int().positive().optional(),
      per_page: z.number().int().positive().max(100).optional(),
    },
    handler: async (args) => {
      try {
        const data = await client.get('/leads', args as Record<string, string | number | undefined>);
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
