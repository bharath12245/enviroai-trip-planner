import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeoapifyPlace {
  properties: {
    place_id: string;
    name?: string;
    lat: number;
    lon: number;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    categories?: string[];
  };
}

interface PlaceResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { lat, lon, radius, categories } = body;

    // Validate required parameters
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return new Response(
        JSON.stringify({ error: 'lat and lon are required and must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'categories is required and must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchRadius = typeof radius === 'number' && radius > 0 ? radius : 3000;

    const apiKey = Deno.env.get('GEOAPIFY_API_KEY');
    if (!apiKey) {
      console.error('GEOAPIFY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Geoapify URL - note: filter uses lon,lat order
    const joinedCategories = categories.join(',');
    const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(joinedCategories)}&filter=circle:${lon},${lat},${searchRadius}&limit=50&apiKey=${apiKey}`;

    console.log('Fetching from Geoapify:', url.replace(apiKey, 'REDACTED'));

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geoapify API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Geoapify API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Geoapify returned', data.features?.length || 0, 'results');

    // Map Geoapify response to clean format
    const places: PlaceResult[] = (data.features || []).map((feature: GeoapifyPlace) => {
      const props = feature.properties;
      return {
        id: props.place_id || `place-${Math.random().toString(36).substr(2, 9)}`,
        name: props.name || props.address_line1 || 'Unknown Place',
        lat: props.lat,
        lon: props.lon,
        address: props.formatted || props.address_line2 || '',
        category: props.categories?.[0] || 'unknown',
      };
    });

    return new Response(
      JSON.stringify(places),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Places function error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
