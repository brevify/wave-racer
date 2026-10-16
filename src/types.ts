export interface TideItem {
  id?: number;
  date: string;
  tide_time: string;
  height_metres: string;
  tide_type: 'high' | 'low';
  created_at?: string;
  updated_at?: string;
}

export interface TideDataResponse {
  today?: TideItem[];
  tomorrow?: TideItem[];
  error?: string;
}

export interface UVReading {
  id?: number;
  uv_value: number;
  category: string;
  timestamp: string;
}

export interface UVDataResponse {
  current?: UVReading;
  history?: Array<{
    date: string;
    reading_time: string;
    uv_value: number;
    band: string;
    color: string;
  }>;
  error?: string;
}

export interface HeatStressReading {
  id?: number;
  wbgt_value: string;
  category: string;
  timestamp: string;
}

export interface HeatStressResponse {
  current?: HeatStressReading;
  history?: HeatStressReading[];
  error?: string;
}

export interface WeatherStation {
  id: string;
  deviceId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface WindReadingItem {
  stationId: string;
  value: number;
}

export interface WindApiResponse {
  code?: number;
  data?: {
    readingType?: string;
    readingUnit?: string;
    stations?: WeatherStation[];
    readings?: Array<{
      timestamp: string;
      data: WindReadingItem[];
    }>;
  };
  error?: string;
}

export interface EndpointStatus {
  endpoint: string;
  name: string;
  sourceUrl: string;
  internalPath: string;
  status: 'loading' | 'healthy' | 'slow' | 'refused' | 'empty' | 'error';
  statusCode?: number;
  latencyMs?: number;
  message: string;
  lastUpdated?: string;
}

export type WaterSportType = 'fishing' | 'jetski' | 'yachting' | 'kayak' | 'swimming';

export interface BeachSpot {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  popularActivities: WaterSportType[];
  description: string;
  bestTide: 'high' | 'rising' | 'slack' | 'falling';
  shelterLevel: 'Sheltered' | 'Moderate Exposure' | 'Open Sea';
  nearestStationName?: string;
}

export interface ConditionEvaluation {
  overallScore: number; // 0 - 100
  overallStatus: 'Prime' | 'Fair' | 'Caution' | 'Unfavorable';
  summaryProse: string;
  windSpeedKnots?: number;
  windDirectionDeg?: number;
  windDirectionCompass?: string;
  tideHeightMetres?: number;
  tideStage?: string;
  nextTideEvent?: {
    type: 'high' | 'low';
    time: string;
    height: string;
  };
  heatStressCategory?: string;
  heatStressWbgt?: number;
  uvIndex?: number;
  uvCategory?: string;
  activityScores: Record<WaterSportType, { score: number; status: string; advice: string }>;
}

export interface PartnerVendor {
  id: string;
  name: string;
  category: 'Boat Rental' | 'Fishing Charter' | 'Water Sports Equipment' | 'Sailing & Yacht';
  beachId: string;
  locationName: string;
  rateLabel: string;
  description: string;
  amenities: string[];
  contactNumber: string;
  imageUrl: string;
  verifiedPartner: boolean;
  royaltyContributionRate: string;
}
