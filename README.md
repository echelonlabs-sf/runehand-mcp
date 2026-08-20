# @runehand/mcp-server

MCP server that wraps the Runehand public API v1 as tools, so an MCP client (Claude Desktop, Claude Code,
etc.) can operate Runehand bots directly: list bots and flows, read and reply to conversations, manage
leads, and check analytics.

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
`not_found: Not found.`) — see the error codes table below.

## Errors

All error responses from `/api/v1/*` use the same shape:

```json
{
  "error": {
    "code": "plan_upgrade_required",
    "message": "Your current plan does not include API access.",
    "details": {
      "required_tiers": ["pro", "enterprise"]
    }
  }
}
```

`details` is `null` when not applicable.

| Code | HTTP | When |
|---|---|---|
| `unauthenticated` | 401 | Missing header, invalid/revoked/expired token |
| `workspace_inactive` | 403 | Workspace is frozen or subscription lapsed |
| `plan_upgrade_required` | 403 | Workspace's plan doesn't include API access |
| `validation_failed` | 422 | Request data failed validation |
| `not_found` | 404 | Resource doesn't exist or doesn't belong to the key's workspace |
| `rate_limited` | 429 | Plan's requests-per-minute limit exceeded |
| `server_error` | 500 | Unhandled internal error |

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
