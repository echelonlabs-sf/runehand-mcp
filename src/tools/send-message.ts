import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function sendMessageTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'send_message',
    title: 'Send message',
    description:
      'Send a message as the agent in an existing conversation. Delivers to the external channel ' +
      '(WhatsApp, Telegram, etc.) when the conversation is not on the web channel.',
    inputSchema: {
      conversation_id: z.string().uuid().describe('UUID of the conversation to send the message in.'),
      content: z.string().min(1).max(4096).describe('Message text, max 4096 characters.'),
    },
    handler: async (args) => {
      try {
        const conversationId = args.conversation_id as string;
        const data = await client.post(`/conversations/${conversationId}/messages`, {
          content: args.content as string,
        });
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
