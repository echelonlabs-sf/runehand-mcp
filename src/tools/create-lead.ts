import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function createLeadTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'create_lead',
    title: 'Create lead',
    description: 'Create a lead directly, without an associated conversation. Does not trigger the LeadCaptured event.',
    inputSchema: {
      bot_id: z.string().uuid().describe('UUID of the bot this lead belongs to.'),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      source: z.string().optional().describe("Defaults to 'api' when omitted."),
      custom_fields: z.record(z.string(), z.unknown()).optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
    },
    handler: async (args) => {
      try {
        const { bot_id, name, email, phone, source, custom_fields, tags, notes } = args as {
          bot_id: string;
          name?: string;
          email?: string;
          phone?: string;
          source?: string;
          custom_fields?: Record<string, unknown>;
          tags?: string[];
          notes?: string;
        };
        const data = await client.post('/leads', { bot_id, name, email, phone, source, custom_fields, tags, notes });
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
