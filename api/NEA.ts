import type { Request, Response } from 'express';

export type EndpointType = 'tides' | 'uv' | 'heat-stress' | 'wind-speed' | 'wind-direction';

const ENDPOINTS: Record<EndpointType, string> = {
  tides: 'https://neaweather.com/api/v1/tides',
  uv: 'https://neaweather.com/api/v1/uv',
  'heat-stress': 'https://neaweather.com/api/v1/heat-stress',
  'wind-speed': 'https://api-open.data.gov.sg/v2/real-time/api/wind-speed',
  'wind-direction': 'https://api-open.data.gov.sg/v2/real-time/api/wind-direction',
};

export async function fetchNEAData(endpointType: EndpointType, req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

  // Guardrail 4: If a key variable is present but empty, return 503 "key not configured"
  if (process.env.NEA_API_KEY !== undefined && process.env.NEA_API_KEY.trim() === '') {
    return res.status(503).json({
      error: 'key not configured',
      message: 'NEA_API_KEY variable is empty. Please configure a valid key or leave unset.',
      endpoint: endpointType,
    });
  }

  const targetUrl = ENDPOINTS[endpointType];
  if (!targetUrl) {
    return res.status(400).json({
      error: 'invalid_endpoint',
      message: `Unknown endpoint type: ${endpointType}. Allowed: ${Object.keys(ENDPOINTS).join(', ')}`,
    });
  }

  const controller = new AbortController();
  const timeoutMs = 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'WaveReady-Singapore-Marine/1.0',
    };

    if (process.env.NEA_API_KEY && process.env.NEA_API_KEY.trim().length > 0) {
      headers['Authorization'] = `Bearer ${process.env.NEA_API_KEY.trim()}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'provider_error',
        message: `External NEA / Data.gov.sg provider returned HTTP ${response.status} (${response.statusText}).`,
        endpoint: endpointType,
        targetUrl,
        latencyMs,
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      endpoint: endpointType,
      source: targetUrl.includes('data.gov.sg') ? 'data.gov.sg' : 'neaweather.com',
      latencyMs,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isAbort = (err as Error)?.name === 'AbortError';

    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'timeout_error' : 'network_error',
      message: isAbort
        ? `Request to ${targetUrl} timed out after ${timeoutMs}ms. Provider is slow or unresponsive.`
        : `Network connection to provider refused or unreachable: ${(err as Error)?.message || 'Unknown network error'}.`,
      endpoint: endpointType,
      targetUrl,
      latencyMs,
    });
  }
}

export default async function handler(req: Request, res: Response) {
  // Determine type from query param, path, or header
  const rawType = (req.query.type as string) || req.path.replace(/^\/api\//, '');
  const type = rawType.replace(/^\/?/, '') as EndpointType;

  if (!ENDPOINTS[type]) {
    // If called with /api/NEA without query, provide directory of endpoints
    return res.status(200).json({
      service: 'WaveReady NEA API Gateway',
      availableEndpoints: Object.keys(ENDPOINTS),
      usage: 'Pass ?type=tides | uv | heat-stress | wind-speed | wind-direction or request /api/<endpoint>',
      guardrailNotice: 'Zero invented data. Plain language errors returned on failure.',
    });
  }

  return fetchNEAData(type, req, res);
}
