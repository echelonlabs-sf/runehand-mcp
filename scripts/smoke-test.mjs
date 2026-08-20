import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const apiKey = process.env.RUNEHAND_API_KEY;
if (!apiKey) {
  console.error('Set RUNEHAND_API_KEY before running the smoke test.');
  process.exit(1);
}

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/index.js'],
  env: {
    RUNEHAND_API_KEY: apiKey,
    RUNEHAND_API_BASE_URL: process.env.RUNEHAND_API_BASE_URL ?? 'https://app.runehand.co/api/v1',
  },
});

const client = new Client({ name: 'smoke-test-client', version: '0.0.0' });
await client.connect(transport);

const tools = await client.listTools();
console.log(
  'Tools registered (%d): %s',
  tools.tools.length,
  tools.tools.map((t) => t.name).join(', ')
);

const result = await client.callTool({ name: 'list_bots', arguments: {} });
console.log('list_bots result:', JSON.stringify(result, null, 2));

await client.close();
