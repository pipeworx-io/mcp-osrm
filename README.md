# mcp-osrm

OSRM MCP — routing via the public demo server

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `route` | Compute the fastest route between two or more waypoints. |
| `table` | Distance / duration matrix between source and destination points. |
| `nearest` | Snap a single point to the nearest road segment. |
| `match` | Map-match a noisy GPS trace. |
| `trip` | Solve a TSP-like trip between multiple waypoints. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "osrm": {
      "url": "https://gateway.pipeworx.io/osrm/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Osrm data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
