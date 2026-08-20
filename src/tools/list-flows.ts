import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function listFlowsTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'list_flows',
    title: 'List flows',
    description: "List the flows that belong to a bot, given the bot's UUID.",
    inputSchema: {
      bot_id: z.string().uuid().describe('UUID of the bot whose flows to list.'),
      page: z.number().int().positive().optional(),
      per_page: z.number().int().positive().max(100).optional(),
    },
    handler: async (args) => {
      try {
        const botId = args.bot_id as string;
        const data = await client.get(`/bots/${botId}/flows`, {
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
