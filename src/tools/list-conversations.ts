import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function listConversationsTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'list_conversations',
    title: 'List conversations',
    description: 'List conversations for the workspace, optionally filtered by bot_id and/or status.',
    inputSchema: {
      bot_id: z.string().uuid().optional().describe('Filter by bot UUID.'),
      status: z.enum(['active', 'waiting', 'closed', 'archived']).optional(),
      page: z.number().int().positive().optional(),
      per_page: z.number().int().positive().max(100).optional(),
    },
    handler: async (args) => {
      try {
        const data = await client.get('/conversations', args as Record<string, string | number | undefined>);
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
