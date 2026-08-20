# @runehand/mcp-server

MCP server that wraps the [Runehand public API v1](https://github.com/echelonlabs-sf/converso-app/blob/main/docs/api-v1.md)
as tools, so an MCP client (Claude Desktop, Claude Code, etc.) can operate Runehand bots directly:
list bots and flows, read and reply to conversations, manage leads, and check analytics.

## Setup

1. Generate an API key at `https://app.runehand.co/settings/api-keys` (requires a Pro or Enterprise plan,
   and the `owner` or `admin` role in the workspace). The plaintext key is shown once — copy it.
2. Add this to your MCP client's config (example: Claude Desktop's `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "runehand": {
      "command": "npx",
      "args": ["-y", "@runehand/mcp-server"],
      "env": { "RUNEHAND_API_KEY": "rh_live_..." }
    }
  }
}
```

3. Restart your MCP client. It should now list 9 Runehand tools.

## Configuration

| Env var | Required | Default | Purpose |
|---|---|---|---|
| `RUNEHAND_API_KEY` | Yes | — | Bearer token from `/settings/api-keys`. |
| `RUNEHAND_API_BASE_URL` | No | `https://app.runehand.co/api/v1` | Override for local/staging testing only. |

## Tools

| Tool | Description |
|---|---|
| `list_bots` | List the bots that belong to the workspace that owns the API key. |
| `list_flows` | List the flows that belong to a bot, given the bot's UUID. |
| `get_flow` | Get a single flow, including its nodes in executable format. |
| `list_conversations` | List conversations, optionally filtered by `bot_id` and/or `status`. |
| `get_conversation` | Get a single conversation, including its messages. |
| `send_message` | Send a message as the agent in an existing conversation. |
| `list_leads` | List leads, optionally filtered by `bot_id` and/or `status`. |
| `create_lead` | Create a lead directly, without an associated conversation. |
| `get_analytics` | Get workspace KPIs and quick stats for a date range. |

Errors from the Runehand API surface as tool errors in the form `"{code}: {message}"` (e.g.
`not_found: Not found.`) — see the [error codes table](https://github.com/echelonlabs-sf/converso-app/blob/main/docs/api-v1.md#formato-de-errores)
in the API docs.

## Development

```bash
npm install
npm run dev      # run directly with tsx, no build step
npm test         # vitest, mocks all HTTP via msw
npm run lint
npm run typecheck
npm run build     # compiles to dist/
```

## License

MIT
