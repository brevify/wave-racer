import {
  BeachSpot,
  ConditionEvaluation,
  HeatStressResponse,
  TideDataResponse,
  UVDataResponse,
  WindApiResponse,
  WaterSportType,
} from '../types';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function degreesToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || 'Variable';
}

export function findNearestWindReading(
  beach: BeachSpot,
  windData: WindApiResponse | null
): { stationName: string; value: number | null } {
  if (!windData || !windData.data || !windData.data.stations || !windData.data.readings) {
    return { stationName: 'Sensor offline', value: null };
  }

  const stations = windData.data.stations;
  const latestReadings = windData.data.readings[0]?.data || [];

  let minDistance = Infinity;
  let nearestStationId = '';
  let nearestStationName = '';

  for (const st of stations) {
    const dist = calculateDistanceKm(beach.lat, beach.lon, st.location.latitude, st.location.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStationId = st.id;
      nearestStationName = st.name;
    }
  }

  const matchedReading = latestReadings.find((r) => r.stationId === nearestStationId);
  return {
    stationName: nearestStationName || 'Station',
    value: matchedReading !== undefined ? matchedReading.value : null,
  };
}

export function evaluateBeachCondition(
  beach: BeachSpot,
  tides: TideDataResponse | null,
  uv: UVDataResponse | null,
  heatStress: HeatStressResponse | null,
  windSpeedData: WindApiResponse | null,
  windDirData: WindApiResponse | null
): ConditionEvaluation {
  const windSpeedResult = findNearestWindReading(beach, windSpeedData);
  const windDirResult = findNearestWindReading(beach, windDirData);

  const windSpeed = windSpeedResult.value ?? 6.0; // fallback if sensor offline
  const windDir = windDirResult.value ?? 110;
  const windCompass = degreesToCompass(windDir);

  // Tide analysis from NEA today
  const todayTides = tides?.today || [];
  let tideHeight = 2.1;
  let tideStage = 'Moderate Tide';
  let nextEvent: { type: 'high' | 'low'; time: string; height: string } | undefined;

  if (todayTides.length > 0) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let upcoming = todayTides.find((t) => {
      const [h, m] = t.tide_time.split(':').map(Number);
      return h * 60 + m >= currentMinutes;
    });

    if (!upcoming) {
      upcoming = todayTides[0];
    }

    if (upcoming) {
      nextEvent = {
        type: upcoming.tide_type,
        time: upcoming.tide_time.slice(0, 5),
        height: `${upcoming.height_metres}m`,
      };
      tideHeight = parseFloat(upcoming.height_metres) || 2.1;
      tideStage = upcoming.tide_type === 'high' ? 'High Tide Water Window' : 'Low Tide Water Window';
    }
  }

  // UV & Heat
  const uvVal = uv?.current?.uv_value ?? 4;
  const uvCat = uv?.current?.category || (uvVal >= 8 ? 'Very High' : uvVal >= 6 ? 'High' : uvVal >= 3 ? 'Moderate' : 'Low');

  const heatWbgt = heatStress?.current ? parseFloat(heatStress.current.wbgt_value) : 30.5;
  const heatCat = heatStress?.current?.category || (heatWbgt >= 32 ? 'High' : heatWbgt >= 29 ? 'Moderate' : 'Low');

  // Compute sport scores
  let fishingScore = 85;
  let jetskiScore = 85;
  let yachtingScore = 80;
  let kayakScore = 80;
  let swimmingScore = 85;

  // Wind speed penalties
  if (windSpeed > 18) {
    fishingScore -= 30;
    kayakScore -= 45;
    jetskiScore -= 25;
    swimmingScore -= 35;
    yachtingScore += 5; // Good for experienced sailors
  } else if (windSpeed > 12) {
    fishingScore -= 10;
    kayakScore -= 20;
    jetskiScore -= 10;
    swimmingScore -= 15;
    yachtingScore += 15; // optimal for sailing
  } else if (windSpeed < 4) {
    yachtingScore -= 25; // too light for sailing
    kayakScore += 15; // glassy waters!
    jetskiScore += 10;
  }

  // Tide matching
  if (beach.bestTide === 'rising' && tideHeight > 2.0) {
    fishingScore += 10;
  }
  if (tideHeight < 1.2) {
    jetskiScore -= 15; // shallow reef risk
    fishingScore -= 10;
  }

  // Heat / UV impact on open water charters
  if (heatCat === 'High') {
    fishingScore -= 10;
    kayakScore -= 15;
    swimmingScore -= 10;
  }
  if (uvVal >= 8) {
    swimmingScore -= 10;
    kayakScore -= 10;
  }

  // Clamp scores between 20 and 98
  const clamp = (val: number) => Math.max(20, Math.min(98, Math.round(val)));

  fishingScore = clamp(fishingScore);
  jetskiScore = clamp(jetskiScore);
  yachtingScore = clamp(yachtingScore);
  kayakScore = clamp(kayakScore);
  swimmingScore = clamp(swimmingScore);

  const averageScore = Math.round(
    (fishingScore + jetskiScore + yachtingScore + kayakScore + swimmingScore) / 5
  );

  let overallStatus: 'Prime' | 'Fair' | 'Caution' | 'Unfavorable' = 'Fair';
  let summaryProse = 'Conditions are acceptable for coastal boating and recreational water activities.';

  if (averageScore >= 80) {
    overallStatus = 'Prime';
    summaryProse = `Optimal coastal window at ${beach.name}. Stable wind (${windSpeed} kts from ${windCompass}) with favorable tide depth (${tideHeight}m).`;
  } else if (averageScore >= 60) {
    overallStatus = 'Fair';
    summaryProse = `Good operating conditions with ${windSpeed} kts winds. Pay attention to peak afternoon UV levels.`;
  } else if (averageScore >= 45) {
    overallStatus = 'Caution';
    summaryProse = `Moderate chop or intense heat index (${heatWbgt}°C WBGT). Caution advised for paddle craft and small vessels.`;
  } else {
    overallStatus = 'Unfavorable';
    summaryProse = `Adverse sea state or high heat stress detected. Not recommended for recreational charter operations.`;
  }

  return {
    overallScore: averageScore,
    overallStatus,
    summaryProse,
    windSpeedKnots: windSpeed,
    windDirectionDeg: windDir,
    windDirectionCompass: windCompass,
    tideHeightMetres: tideHeight,
    tideStage,
    nextTideEvent: nextEvent,
    heatStressCategory: heatCat,
    heatStressWbgt: heatWbgt,
    uvIndex: uvVal,
    uvCategory: uvCat,
    activityScores: {
      fishing: {
        score: fishingScore,
        status: fishingScore >= 75 ? 'Prime Bite Window' : fishingScore >= 55 ? 'Moderate' : 'Low Activity',
        advice: fishingScore >= 75 ? 'Optimal tidal movement for pelagic and reef predators.' : 'Stick to protected reef kelongs.',
      },
      jetski: {
        score: jetskiScore,
        status: jetskiScore >= 75 ? 'Glassy / Smooth' : jetskiScore >= 55 ? 'Light Chop' : 'Rough Sea',
        advice: jetskiScore >= 75 ? 'Excellent surface conditions for high-speed runs.' : 'Watch out for shallows and reef crests.',
      },
      yachting: {
        score: yachtingScore,
        status: yachtingScore >= 75 ? 'Great Sailing Breeze' : yachtingScore >= 55 ? 'Fair' : 'Slack Wind',
        advice: yachtingScore >= 75 ? `${windSpeed} kts wind generates ideal heel and cruising speed.` : 'Motor-cruising recommended.',
      },
      kayak: {
        score: kayakScore,
        status: kayakScore >= 75 ? 'Calm & Sheltered' : kayakScore >= 55 ? 'Manageable Drift' : 'Strong Current',
        advice: kayakScore >= 75 ? 'Minimal wind resistance; perfect for distance paddling.' : 'Stay within the inner lagoon line.',
      },
      swimming: {
        score: swimmingScore,
        status: swimmingScore >= 75 ? 'Safe Coastal Waters' : swimmingScore >= 55 ? 'Moderate Sun Risk' : 'High UV / Chop',
        advice: swimmingScore >= 75 ? 'Clear waters with gentle shore swell.' : 'Apply broad-spectrum water-resistant sunscreen.',
      },
    },
  };
}
