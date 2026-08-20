import { describe, it, expect } from 'vitest';
import { buildTools } from '../../src/tools/index.js';
import { RunehandApiClient } from '../../src/client.js';

describe('buildTools', () => {
  it('registers exactly the 9 expected tools, each with a title, description, and handler', () => {
    const client = new RunehandApiClient({ apiKey: 'rh_live_test', baseUrl: 'https://api.test/api/v1' });
    const tools = buildTools(client);

    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      'create_lead',
      'get_analytics',
      'get_conversation',
      'get_flow',
      'list_bots',
      'list_conversations',
      'list_flows',
      'list_leads',
      'send_message',
    ]);

    for (const tool of tools) {
      expect(tool.title).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(typeof tool.handler).toBe('function');
    }
  });
});
