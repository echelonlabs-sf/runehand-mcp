import { z } from 'zod';
import type { RunehandApiClient } from '../client.js';
import { ok, errorResult } from './tool-result.js';
import type { RunehandTool } from './types.js';

export function getFlowTool(client: RunehandApiClient): RunehandTool {
  return {
    name: 'get_flow',
    title: 'Get flow detail',
    description: 'Get a single flow, including its nodes in executable format.',
    inputSchema: {
      flow_id: z.string().uuid().describe('UUID of the flow to fetch.'),
    },
    handler: async (args) => {
      try {
        const flowId = args.flow_id as string;
        const data = await client.get(`/flows/${flowId}`);
        return ok(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}
