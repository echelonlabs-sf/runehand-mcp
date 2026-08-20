import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function getConversationTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'get_conversation',
    title: 'Get conversation detail',
    description: 'Get a single conversation, including its messages in chronological order.',
    inputSchema: {
      conversation_id: z.string().uuid().describe('UUID of the conversation to fetch.'),
    },
    handler: async (args) => {
      try {
        const conversationId = args.conversation_id as string;
        const data = await client.get(`/conversations/${conversationId}`);
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
