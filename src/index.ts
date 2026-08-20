#!/usr/bin/env node
import type { z } from 'zod';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { RunehandApiClient } from './client.js';
import { buildTools } from './tools/index.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new RunehandApiClient(config);
  const server = new McpServer({ name: 'runehand-mcp', version: '0.1.0' });

  for (const tool of buildTools(client)) {
    server.registerTool(
      tool.name,
      { title: tool.title, description: tool.description, inputSchema: tool.inputSchema },
      // RunehandTool.handler is (args) => Promise<ToolResult>: a single-argument function
      // returning our own ToolResult interface. The SDK's ToolCallback expects a second
      // `extra` parameter (fine — JS callbacks may ignore trailing args) and a CallToolResult
      // return type that carries an index signature from its Zod "loose" schema, which our
      // plain ToolResult interface structurally satisfies at runtime but not nominally.
      // The cast bridges that TS nominal gap; see task-7-report.md for the SDK investigation.
      tool.handler as unknown as ToolCallback<Record<string, z.ZodTypeAny>>
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`runehand-mcp failed to start: ${message}`);
  process.exit(1);
});
