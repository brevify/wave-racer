import {
  TideDataResponse,
  UVDataResponse,
  HeatStressResponse,
  WindApiResponse,
  EndpointStatus,
} from '../types';

export interface LiveConditionsBundle {
  tides: TideDataResponse | null;
  uv: UVDataResponse | null;
  heatStress: HeatStressResponse | null;
  windSpeed: WindApiResponse | null;
  windDirection: WindApiResponse | null;
  diagnostics: Record<string, EndpointStatus>;
  lastFetchedAt: string;
}

export async function fetchWithDiagnostics<T>(
  url: string,
  name: string,
  sourceUrl: string
): Promise<{ data: T | null; status: EndpointStatus }> {
  const startTime = Date.now();
  const endpointStatus: EndpointStatus = {
    endpoint: url,
    name,
    sourceUrl,
    internalPath: url,
    status: 'loading',
    message: 'Initiating request...',
  };

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;
    endpointStatus.latencyMs = latencyMs;
    endpointStatus.statusCode = res.status;
    endpointStatus.lastUpdated = new Date().toLocaleTimeString();

    if (!res.ok) {
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson.message || errJson.error || '';
      } catch {
        // non-json response
      }

      endpointStatus.status = 'refused';
      endpointStatus.message = `Data provider refused or returned HTTP ${res.status}${
        errDetail ? `: ${errDetail}` : ''
      }. Plain words: Remote sensor service is currently unavailable.`;
      return { data: null, status: endpointStatus };
    }

    const json = await res.json();
    const actualData = (json.data !== undefined && json.success !== undefined) ? json.data : json;

    // Check for empty data
    if (!actualData || (Array.isArray(actualData) && actualData.length === 0)) {
      endpointStatus.status = 'empty';
      endpointStatus.message = 'The provider returned an empty response. No readings are currently logged.';
      return { data: null, status: endpointStatus };
    }

    // Check if response was unusually slow (> 3500ms)
    if (latencyMs > 3500) {
      endpointStatus.status = 'slow';
      endpointStatus.message = `Data received, but connection is slow (${(latencyMs / 1000).toFixed(1)}s latency).`;
    } else {
      endpointStatus.status = 'healthy';
      endpointStatus.message = `Online · ${latencyMs}ms latency · Live feed verified`;
    }

    return { data: actualData as T, status: endpointStatus };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    endpointStatus.latencyMs = latencyMs;
    endpointStatus.status = 'refused';
    endpointStatus.message = `Connection refused: ${(err as Error)?.message || 'Unable to establish network connection to server'}.`;
    return { data: null, status: endpointStatus };
  }
}

export async function fetchAllLiveMarineData(): Promise<LiveConditionsBundle> {
  const [tidesRes, uvRes, heatRes, windSpeedRes, windDirRes] = await Promise.all([
    fetchWithDiagnostics<TideDataResponse>(
      '/api/tides',
      'Coastal Tide Schedule',
      'https://neaweather.com/api/v1/tides'
    ),
    fetchWithDiagnostics<UVDataResponse>(
      '/api/uv',
      'Coastal UV Index',
      'https://neaweather.com/api/v1/uv'
    ),
    fetchWithDiagnostics<HeatStressResponse>(
      '/api/heat-stress',
      'Coastal Heat Stress (WBGT)',
      'https://neaweather.com/api/v1/heat-stress'
    ),
    fetchWithDiagnostics<WindApiResponse>(
      '/api/wind-speed',
      'Coastal Wind Speed',
      'https://api-open.data.gov.sg/v2/real-time/api/wind-speed'
    ),
    fetchWithDiagnostics<WindApiResponse>(
      '/api/wind-direction',
      'Coastal Wind Direction',
      'https://api-open.data.gov.sg/v2/real-time/api/wind-direction'
    ),
  ]);

  return {
    tides: tidesRes.data,
    uv: uvRes.data,
    heatStress: heatRes.data,
    windSpeed: windSpeedRes.data,
    windDirection: windDirRes.data,
    diagnostics: {
      tides: tidesRes.status,
      uv: uvRes.status,
      heatStress: heatRes.status,
      windSpeed: windSpeedRes.status,
      windDirection: windDirRes.status,
    },
    lastFetchedAt: new Date().toLocaleTimeString(),
  };
}
