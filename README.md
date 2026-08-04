# @pipeworx/osrm

OSRM (Open Source Routing Machine) MCP — routing, distance matrix, and snap-to-road via the public demo server. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `route(coordinates, profile?, overview?, alternatives?, steps?, annotations?)` — fastest route between waypoints
- `table(coordinates, profile?, sources?, destinations?, annotations?)` — distance/duration matrix
- `nearest(longitude, latitude, profile?, number?)` — snap a point to the road network
- `match(coordinates, profile?, radiuses?)` — map-match a noisy GPS trace
- `trip(coordinates, profile?, roundtrip?, source?, destination?)` — solve a TSP-style trip

## Profiles

`car` (default), `bike`, `foot` — all available on the public demo. Switch hosts for custom OSRM instances.

## Data source

`https://router.project-osrm.org/` — public demo server. Fair-use only; for production load run your own OSRM instance.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
