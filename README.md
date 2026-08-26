# @pipeworx/osrm

OSRM (Open Source Routing Machine) MCP — routing, distance matrix, and snap-to-road via the public demo server. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/osrm/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Osrm data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
