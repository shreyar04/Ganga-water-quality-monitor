// Water Quality Service for API integration
export interface WaterQualityData {
  location: string;
  parameter: string;
  historical: number[];
  forecast: number[];
  timestamp: string;
}

export interface LocationData {
  location: string;
  coordinates: [number, number];
  parameters: {
    DO: number;
    BOD: number;
    NITRATE_N_NITRITE_N: number;
    FECAL_COLIFORM: number;
    pH: number;
    TEMP: number;
  };
  healthIndex: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  parameter: string;
  value: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

// Real data from the CSV dataset
const LOCATION_DATA: Record<string, LocationData> = {
  'Varanasi': {
    location: 'Varanasi',
    coordinates: [83.0037, 25.3176],
    parameters: {
      DO: 7.8, // Average from Varanasi data points
      BOD: 4.5,
      NITRATE_N_NITRITE_N: 0,
      FECAL_COLIFORM: 31167, // From "GANGA AT VARANASI D/S (MALVIYA BRIDGE)"
      pH: 8.5,
      TEMP: 22.5
    },
    healthIndex: 65,
    alerts: [
      {
        id: '1',
        parameter: 'BOD',
        value: 4.5,
        threshold: 3.0,
        severity: 'warning',
        timestamp: new Date().toISOString()
      }
    ]
  },
  'Kanpur': {
    location: 'Kanpur',
    coordinates: [80.3319, 26.4499],
    parameters: {
      DO: 6.3, // From "GANGA AT KANPUR D/S (JAJMAU PUMPING STATION)"
      BOD: 5.5,
      NITRATE_N_NITRITE_N: 0.3,
      FECAL_COLIFORM: 15889,
      pH: 7.7,
      TEMP: 27
    },
    healthIndex: 55,
    alerts: [
      {
        id: '2',
        parameter: 'BOD',
        value: 5.5,
        threshold: 3.0,
        severity: 'critical',
        timestamp: new Date().toISOString()
      }
    ]
  },
  'Haridwar': {
    location: 'Haridwar',
    coordinates: [78.1642, 29.9457],
    parameters: {
      DO: 5.4, // From "GANGA AT HARIDWAR D/S, U.P"
      BOD: 5.3,
      NITRATE_N_NITRITE_N: 0,
      FECAL_COLIFORM: 1600,
      pH: 7.5,
      TEMP: 24.4
    },
    healthIndex: 70,
    alerts: [
      {
        id: '3',
        parameter: 'BOD',
        value: 5.3,
        threshold: 3.0,
        severity: 'critical',
        timestamp: new Date().toISOString()
      }
    ]
  },
  'Patna': {
    location: 'Patna',
    coordinates: [85.1376, 25.5941],
    parameters: {
      DO: 7.9, // From "GANGA AT PATNA D/S (GANGA BRIDGE)"
      BOD: 2.7,
      NITRATE_N_NITRITE_N: 0,
      FECAL_COLIFORM: 3782,
      pH: 8.0,
      TEMP: 24.9
    },
    healthIndex: 75,
    alerts: []
  }
};

// Real Ganga CSV data for forecasting
const GANGA_CSV_DATA = [
  { location: "GANGA AT RISHIKESH U/S, U.P", state: "UTTARAKHAND", temp: 17.2, do: 8.7, ph: 7.7, bod: 1.1, nitrate: 0, fecal_coliform: 22 },
  { location: "GANGA AT HARIDWAR D/S, U.P", state: "UTTARAKHAND", temp: 24.4, do: 5.4, ph: 7.5, bod: 5.3, nitrate: 0, fecal_coliform: 1600 },
  { location: "GANGA AT KANPUR U/S (RANIGHAT), U.P", state: "UTTAR PRADESH", temp: 27, do: 7.5, ph: 8.2, bod: 3.4, nitrate: 0.2, fecal_coliform: 2600 },
  { location: "GANGA AT KANPUR D/S (JAJMAU PUMPING STATION), U.P", state: "UTTAR PRADESH", temp: 27, do: 6.3, ph: 7.7, bod: 5.5, nitrate: 0.3, fecal_coliform: 15889 },
  { location: "GANGA AT VARANASI U/S (ASSIGHAT), U.P", state: "UTTAR PRADESH", temp: 22.5, do: 8.3, ph: 8.2, bod: 2.9, nitrate: 0, fecal_coliform: 2617 },
  { location: "GANGA AT VARANASI D/S (MALVIYA BRIDGE), U.P", state: "UTTAR PRADESH", temp: 22.5, do: 7.8, ph: 8.5, bod: 4.5, nitrate: 0, fecal_coliform: 31167 },
  { location: "GANGA AT PATNA D/S (GANGA BRIDGE),BIHAR", state: "BIHAR", temp: 24.9, do: 7.9, ph: 8, bod: 2.7, nitrate: 0, fecal_coliform: 3782 },
  { location: "GANGA DARBHANGA GHAT AT PATNA", state: "BIHAR", temp: 24.7, do: 7.8, ph: 7.9, bod: 2.8, nitrate: 0, fecal_coliform: 6527 }
];

// Calculate health index based on parameters
export const calculateHealthIndex = (parameters: LocationData['parameters']): number => {
  let score = 100;
  
  // DO scoring (optimal: 6-8 mg/L)
  if (parameters.DO < 4) score -= 30;
  else if (parameters.DO < 6) score -= 15;
  else if (parameters.DO > 8) score -= 10;
  
  // BOD scoring (optimal: < 3 mg/L)
  if (parameters.BOD > 5) score -= 25;
  else if (parameters.BOD > 3) score -= 15;
  
  // pH scoring (optimal: 6.5-8.5)
  if (parameters.pH < 6.5 || parameters.pH > 8.5) score -= 10;
  
  // Fecal coliform scoring (optimal: < 500 MPN/100ml)
  if (parameters.FECAL_COLIFORM > 10000) score -= 30;
  else if (parameters.FECAL_COLIFORM > 5000) score -= 20;
  else if (parameters.FECAL_COLIFORM > 1000) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Generate historical data for charts
export const generateHistoricalData = (location: string, parameter: string, days: number = 10) => {
  const data = [];
  const baseValue = LOCATION_DATA[location]?.parameters[parameter as keyof LocationData['parameters']] || 0;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variation to base value
    const variation = (Math.random() - 0.5) * 0.3 * baseValue;
    const value = Math.max(0, baseValue + variation);
    
    data.push({
      date: date.toLocaleDateString(),
      value: parseFloat(value.toFixed(2)),
      type: 'historical'
    });
  }
  
  return data;
};

// Generate forecast data
export const generateForecastData = (location: string, parameter: string, days: number = 3) => {
  const historicalData = generateHistoricalData(location, parameter, 10);
  const lastValue = historicalData[historicalData.length - 1].value;
  const data = [];
  
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // For now, forecast data is random
    const trend = (Math.random() - 0.5) * 0.1;
    const variation = (Math.random() - 0.5) * 0.2 * lastValue;
    const value = Math.max(0, lastValue + (lastValue * trend) + variation);
    
    data.push({
      date: date.toLocaleDateString(),
      value: parseFloat(value.toFixed(2)),
      type: 'forecast'
    });
  }
  
  return data;
};

// API functions
export const waterQualityService = {
  // Get location data
  getLocationData: async (location: string): Promise<LocationData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = LOCATION_DATA[location];
    if (!data) {
      throw new Error(`Location ${location} not found`);
    }
    
    // Update health index
    data.healthIndex = calculateHealthIndex(data.parameters);
    
    return data;
  },

  // Get forecast data using Supabase Edge Function
  getForecast: async (location: string, parameter: string): Promise<WaterQualityData> => {
    try {
      const response = await fetch(
        `https://ccmoxgvhzsaypgpdzust.supabase.co/functions/v1/forecast-water-quality?location=${location}&parameter=${parameter}`,
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbW94Z3ZoenNheXBncGR6dXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTA1MzIsImV4cCI6MjA3MzkyNjUzMn0.Gd1YVRKwt2El9iVFUPuGl7j3_IHPZMFKYUfkDQ6qbgY`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        location: data.location,
        parameter: data.parameter,
        historical: data.historical,
        forecast: data.forecast,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Fallback to local data generation
      const historical = generateHistoricalData(location, parameter, 10).map(d => d.value);
      const forecast = generateForecastData(location, parameter, 3).map(d => d.value);
      
      return {
        location,
        parameter,
        historical,
        forecast,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Get combined chart data
  getChartData: async (location: string, parameter: string) => {
    try {
      const forecastData = await waterQualityService.getForecast(location, parameter);
      
      // Convert to chart format
      const chartData = [];
      
      // Add historical data
      forecastData.historical.forEach((value, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (forecastData.historical.length - 1 - index));
        chartData.push({
          date: date.toLocaleDateString(),
          value,
          type: 'historical'
        });
      });
      
      // Add forecast data
      forecastData.forecast.forEach((value, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        chartData.push({
          date: date.toLocaleDateString(),
          value,
          type: 'forecast'
        });
      });
      
      return chartData;
    } catch (error) {
      console.error('Error getting chart data:', error);
      // Fallback to local generation
      const historical = generateHistoricalData(location, parameter, 10);
      const forecast = generateForecastData(location, parameter, 3);
      return [...historical, ...forecast];
    }
  },

  // Get all locations
  getAllLocations: async () => {
    return Object.keys(LOCATION_DATA);
  },

  // Get alerts for location
  getAlerts: async (location: string): Promise<Alert[]> => {
    const data = LOCATION_DATA[location];
    return data?.alerts || [];
  }
};

// Thresholds for different parameters
export const PARAMETER_THRESHOLDS = {
  DO: { min: 4.0, optimal: [6, 8], max: 12 },
  BOD: { max: 3.0, critical: 5.0 },
  NITRATE_N_NITRITE_N: { max: 45 },
  FECAL_COLIFORM: { max: 500, critical: 10000 },
  pH: { min: 6.5, max: 8.5 },
  TEMP: { max: 30 }
};