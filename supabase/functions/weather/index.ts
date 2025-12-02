import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Weather code to condition mapping
const weatherCodeToCondition: Record<number, { main: string; description: string; icon: string }> = {
  0: { main: 'Clear', description: 'clear sky', icon: '01d' },
  1: { main: 'Clear', description: 'mainly clear', icon: '01d' },
  2: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
  3: { main: 'Clouds', description: 'overcast', icon: '03d' },
  45: { main: 'Fog', description: 'fog', icon: '50d' },
  48: { main: 'Fog', description: 'depositing rime fog', icon: '50d' },
  51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
  53: { main: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
  55: { main: 'Drizzle', description: 'dense drizzle', icon: '09d' },
  61: { main: 'Rain', description: 'slight rain', icon: '10d' },
  63: { main: 'Rain', description: 'moderate rain', icon: '10d' },
  65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
  71: { main: 'Snow', description: 'slight snow', icon: '13d' },
  73: { main: 'Snow', description: 'moderate snow', icon: '13d' },
  75: { main: 'Snow', description: 'heavy snow', icon: '13d' },
  80: { main: 'Rain', description: 'slight rain showers', icon: '09d' },
  81: { main: 'Rain', description: 'moderate rain showers', icon: '09d' },
  82: { main: 'Rain', description: 'violent rain showers', icon: '09d' },
  95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
  96: { main: 'Thunderstorm', description: 'thunderstorm with hail', icon: '11d' },
  99: { main: 'Thunderstorm', description: 'severe thunderstorm', icon: '11d' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, location } = await req.json();

    let latitude = lat;
    let longitude = lon;
    let locationName = location || 'Unknown';

    // If location name provided, geocode it using OpenStreetMap Nominatim (free, no API key)
    if (location && (!lat || !lon)) {
      console.log('Geocoding location:', location);
      
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
      const geoResponse = await fetch(geoUrl, {
        headers: { "User-Agent": "EnviroAI/1.0 (https://enviroai.app)" }
      });
      const geoData = await geoResponse.json();
      
      console.log('Nominatim response:', JSON.stringify(geoData));
      
      if (geoData && geoData.length > 0) {
        latitude = parseFloat(geoData[0].lat);
        longitude = parseFloat(geoData[0].lon);
        locationName = geoData[0].display_name?.split(',')[0] || location;
        console.log('Geocoded to:', latitude, longitude, locationName);
      } else {
        throw new Error('Location not found. Please try a different city name.');
      }
    }

    if (!latitude || !longitude) {
      throw new Error('Coordinates required. Please provide a location.');
    }

    // Fetch weather data using Open-Meteo API (completely free, no API key)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,relative_humidity_2m_max,wind_speed_10m_max&timezone=auto`;
    
    console.log('Fetching weather from Open-Meteo...');
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Open-Meteo API error:', errorText);
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log('Open-Meteo data received');

    // Get weather condition from code
    const getCondition = (code: number) => {
      return weatherCodeToCondition[code] || { main: 'Unknown', description: 'unknown', icon: '01d' };
    };

    const currentCondition = getCondition(weatherData.current.weather_code);

    // Transform the data for the frontend
    const transformedData = {
      current: {
        temp: Math.round(weatherData.current.temperature_2m),
        feels_like: Math.round(weatherData.current.apparent_temperature),
        humidity: weatherData.current.relative_humidity_2m,
        wind_speed: Math.round(weatherData.current.wind_speed_10m),
        condition: currentCondition.main,
        description: currentCondition.description,
        icon: currentCondition.icon,
      },
      daily: weatherData.daily.time.slice(0, 7).map((date: string, index: number) => {
        const condition = getCondition(weatherData.daily.weather_code[index]);
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return {
          date: dayName,
          temp: Math.round((weatherData.daily.temperature_2m_max[index] + weatherData.daily.temperature_2m_min[index]) / 2),
          tempMin: Math.round(weatherData.daily.temperature_2m_min[index]),
          tempMax: Math.round(weatherData.daily.temperature_2m_max[index]),
          humidity: weatherData.daily.relative_humidity_2m_max[index],
          windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[index]),
          condition: condition.main,
          description: condition.description,
          icon: condition.icon,
        };
      }),
      alerts: [],
      location: {
        lat: latitude,
        lon: longitude,
        name: locationName,
      }
    };

    console.log('Returning weather data for:', locationName);

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Weather function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
