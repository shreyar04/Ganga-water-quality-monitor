import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface GangaDataPoint {
  location: string;
  state: string;
  temp: number;
  do: number;
  ph: number;
  bod: number;
  nitrate: number;
  fecal_coliform: number;
}

// Real Ganga CSV data for forecasting
const GANGA_DATA: GangaDataPoint[] = [
  { location: "GANGA AT RISHIKESH U/S, U.P", state: "UTTARAKHAND", temp: 17.2, do: 8.7, ph: 7.7, bod: 1.1, nitrate: 0, fecal_coliform: 22 },
  { location: "GANGA AT HARIDWAR D/S, U.P", state: "UTTARAKHAND", temp: 24.4, do: 5.4, ph: 7.5, bod: 5.3, nitrate: 0, fecal_coliform: 1600 },
  { location: "GANGA AT KANPUR U/S (RANIGHAT), U.P", state: "UTTAR PRADESH", temp: 27, do: 7.5, ph: 8.2, bod: 3.4, nitrate: 0.2, fecal_coliform: 2600 },
  { location: "GANGA AT KANPUR D/S (JAJMAU PUMPING STATION), U.P", state: "UTTAR PRADESH", temp: 27, do: 6.3, ph: 7.7, bod: 5.5, nitrate: 0.3, fecal_coliform: 15889 },
  { location: "GANGA AT VARANASI U/S (ASSIGHAT), U.P", state: "UTTAR PRADESH", temp: 22.5, do: 8.3, ph: 8.2, bod: 2.9, nitrate: 0, fecal_coliform: 2617 },
  { location: "GANGA AT VARANASI D/S (MALVIYA BRIDGE), U.P", state: "UTTAR PRADESH", temp: 22.5, do: 7.8, ph: 8.5, bod: 4.5, nitrate: 0, fecal_coliform: 31167 },
  { location: "GANGA AT PATNA D/S (GANGA BRIDGE),BIHAR", state: "BIHAR", temp: 24.9, do: 7.9, ph: 8, bod: 2.7, nitrate: 0, fecal_coliform: 3782 },
  { location: "GANGA DARBHANGA GHAT AT PATNA", state: "BIHAR", temp: 24.7, do: 7.8, ph: 7.9, bod: 2.8, nitrate: 0, fecal_coliform: 6527 }
];

// Simple forecasting algorithm based on the Python logic
function forecastParameter(data: number[], days: number = 3): number[] {
  if (data.length === 0) return [];
  
  // Simple linear regression for trend
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate forecast
  const forecast: number[] = [];
  const lastValue = y[y.length - 1];
  
  for (let i = 1; i <= days; i++) {
    const trendValue = slope * (n + i - 1) + intercept;
    // Add some randomness while staying close to trend
    const randomVariation = (Math.random() - 0.5) * 0.2 * lastValue;
    const forecastValue = Math.max(0, trendValue + randomVariation);
    forecast.push(parseFloat(forecastValue.toFixed(2)));
  }
  
  return forecast;
}

// Generate historical data with variation
function generateHistoricalData(baseValue: number, days: number = 10): number[] {
  const data: number[] = [];
  
  for (let i = 0; i < days; i++) {
    // Add variation based on day to simulate realistic patterns
    const dayVariation = Math.sin(i * 0.1) * 0.1 * baseValue;
    const randomVariation = (Math.random() - 0.5) * 0.2 * baseValue;
    const value = Math.max(0, baseValue + dayVariation + randomVariation);
    data.push(parseFloat(value.toFixed(2)));
  }
  
  return data;
}

// Map frontend locations to CSV data
function getLocationData(location: string): GangaDataPoint | null {
  const locationMap: Record<string, string> = {
    'Haridwar': 'GANGA AT HARIDWAR D/S, U.P',
    'Kanpur': 'GANGA AT KANPUR D/S (JAJMAU PUMPING STATION), U.P',
    'Varanasi': 'GANGA AT VARANASI D/S (MALVIYA BRIDGE), U.P',
    'Patna': 'GANGA AT PATNA D/S (GANGA BRIDGE),BIHAR'
  };
  
  const csvLocation = locationMap[location];
  return GANGA_DATA.find(d => d.location === csvLocation) || null;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const location = url.searchParams.get('location');
    const parameter = url.searchParams.get('parameter');

    if (!location || !parameter) {
      return new Response(
        JSON.stringify({ error: 'Missing location or parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const locationData = getLocationData(location);
    if (!locationData) {
      return new Response(
        JSON.stringify({ error: `Location ${location} not found` }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get base value for the parameter
    let baseValue: number;
    switch (parameter.toUpperCase()) {
      case 'DO':
        baseValue = locationData.do;
        break;
      case 'BOD':
        baseValue = locationData.bod;
        break;
      case 'NITRATE_N_NITRITE_N':
        baseValue = locationData.nitrate;
        break;
      case 'FECAL_COLIFORM':
        baseValue = locationData.fecal_coliform;
        break;
      case 'PH':
        baseValue = locationData.ph;
        break;
      case 'TEMP':
        baseValue = locationData.temp;
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Parameter ${parameter} not supported` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    // Generate historical data (10 days)
    const historical = generateHistoricalData(baseValue, 10);
    
    // Generate forecast (3 days)
    const forecast = forecastParameter(historical, 3);

    const result = {
      location,
      parameter,
      historical,
      forecast,
      timestamp: new Date().toISOString(),
      baseValue,
      csvLocation: locationData.location
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in forecast function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})