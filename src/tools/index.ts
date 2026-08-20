import type { RunehandApiClient } from '../client.js';
import type { RunehandTool } from './types.js';
import { listBotsTool } from './list-bots.js';
import { listFlowsTool } from './list-flows.js';
import { getFlowTool } from './get-flow.js';
import { listConversationsTool } from './list-conversations.js';
import { getConversationTool } from './get-conversation.js';
import { sendMessageTool } from './send-message.js';
import { listLeadsTool } from './list-leads.js';
import { createLeadTool } from './create-lead.js';
import { getAnalyticsTool } from './get-analytics.js';

export function buildTools(client: RunehandApiClient): RunehandTool[] {
  return [
    listBotsTool(client),
    listFlowsTool(client),
    getFlowTool(client),
    listConversationsTool(client),
    getConversationTool(client),
    sendMessageTool(client),
    listLeadsTool(client),
    createLeadTool(client),
    getAnalyticsTool(client),
  ];
}
