interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * OSRM MCP — routing via the public demo server
 *
 * Auth: none. Fair-use only on router.project-osrm.org.
 *
 * Docs: https://project-osrm.org/docs/v5.24.0/api/
 */


const BASE = 'https://router.project-osrm.org';

const tools: McpToolExport['tools'] = [
  {
    name: 'route',
    description: 'Compute the fastest route between two or more waypoints.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: {
          type: 'string',
          description: 'Semicolon-separated lon,lat pairs (e.g. "-122.42,37.77;-122.39,37.78")',
        },
        profile: { type: 'string', description: 'car (default) | bike | foot' },
        overview: { type: 'string', description: 'simplified (default) | full | false' },
        alternatives: { type: 'boolean', description: 'Return alternative routes (default false)' },
        steps: { type: 'boolean', description: 'Include turn-by-turn steps (default false)' },
        annotations: {
          type: 'string',
          description: 'duration | nodes | distance | weight | datasources | speed | true | false',
        },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'table',
    description: 'Distance / duration matrix between source and destination points.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'string', description: 'Semicolon-separated lon,lat pairs' },
        profile: { type: 'string', description: 'car | bike | foot (default car)' },
        sources: { type: 'string', description: 'Indices into coordinates that are origins (default all)' },
        destinations: { type: 'string', description: 'Indices into coordinates that are destinations (default all)' },
        annotations: { type: 'string', description: 'duration (default) | distance | duration,distance' },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'nearest',
    description: 'Snap a single point to the nearest road segment.',
    inputSchema: {
      type: 'object',
      properties: {
        longitude: { type: 'number' },
        latitude: { type: 'number' },
        profile: { type: 'string' },
        number: { type: 'number', description: 'How many alternatives to return (default 1)' },
      },
      required: ['longitude', 'latitude'],
    },
  },
  {
    name: 'match',
    description: 'Map-match a noisy GPS trace (semicolon-separated lon,lat pairs) to the road network via OSRM, optionally specifying per-point search radiuses in meters; returns matched route geometry and confidence.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'string' },
        profile: { type: 'string' },
        radiuses: { type: 'string', description: 'Per-point search radius in meters, semicolon-separated' },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'trip',
    description: 'Solve a TSP-like trip between multiple waypoints.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: { type: 'string' },
        profile: { type: 'string' },
        roundtrip: { type: 'boolean', description: 'Return to start (default true)' },
        source: { type: 'string', description: 'first | any (default any)' },
        destination: { type: 'string', description: 'last | any' },
      },
      required: ['coordinates'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const profile = ((args.profile as string) ?? 'car').toLowerCase();
  switch (name) {
    case 'route': {
      const params = new URLSearchParams();
      if (args.overview) params.set('overview', String(args.overview));
      if (args.alternatives !== undefined) params.set('alternatives', String(args.alternatives === true));
      if (args.steps !== undefined) params.set('steps', String(args.steps === true));
      if (args.annotations !== undefined) params.set('annotations', String(args.annotations));
      return osrmGet(`/route/v1/${profile}/${encodeURIComponent(reqStr(args, 'coordinates', '"-122.42,37.77;-122.39,37.78"'))}?${params}`);
    }
    case 'table': {
      const params = new URLSearchParams();
      if (args.sources) params.set('sources', String(args.sources));
      if (args.destinations) params.set('destinations', String(args.destinations));
      if (args.annotations) params.set('annotations', String(args.annotations));
      return osrmGet(`/table/v1/${profile}/${encodeURIComponent(reqStr(args, 'coordinates', '"-122.42,37.77;-122.39,37.78"'))}?${params}`);
    }
    case 'nearest': {
      const lon = reqNum(args, 'longitude', '-122.42');
      const lat = reqNum(args, 'latitude', '37.77');
      const params = new URLSearchParams({ number: String((args.number as number) ?? 1) });
      return osrmGet(`/nearest/v1/${profile}/${lon},${lat}?${params}`);
    }
    case 'match': {
      const params = new URLSearchParams();
      if (args.radiuses) params.set('radiuses', String(args.radiuses));
      return osrmGet(`/match/v1/${profile}/${encodeURIComponent(reqStr(args, 'coordinates', '"-122.42,37.77;-122.41,37.78"'))}?${params}`);
    }
    case 'trip': {
      const params = new URLSearchParams();
      if (args.roundtrip !== undefined) params.set('roundtrip', String(args.roundtrip === true));
      if (args.source) params.set('source', String(args.source));
      if (args.destination) params.set('destination', String(args.destination));
      return osrmGet(`/trip/v1/${profile}/${encodeURIComponent(reqStr(args, 'coordinates', '"-122.42,37.77;-122.41,37.78;-122.39,37.78"'))}?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function osrmGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-osrm/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 400) {
    const t = await res.text();
    throw new Error(`OSRM bad request: ${t.slice(0, 200)}`);
  }
  if (res.status === 429) throw new Error('OSRM: rate-limit (HTTP 429) — demo server fair-use');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OSRM error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}
function reqNum(args: Record<string, unknown>, key: string, example: string): number {
  const v = args[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`Required argument "${key}" must be a number. Example: ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
