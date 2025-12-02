import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    const dealType = type || 'all';
    
    const prompt = `Generate 6 realistic travel deals for ${destination || 'popular destinations'}. 
    ${dealType !== 'all' ? `Focus on ${dealType} deals only.` : 'Include flights, hotels, and activities.'}
    
    Return a JSON array with this exact structure:
    [
      {
        "id": "unique_id",
        "type": "flight" | "hotel" | "activity",
        "provider": "realistic provider name",
        "title": "deal title",
        "description": "brief description",
        "originalPrice": number,
        "discountedPrice": number,
        "currency": "INR",
        "rating": number between 4.0-5.0,
        "dealType": "flash-sale" | "early-bird" | "last-minute" | "exclusive",
        "imageUrl": "unsplash image url related to the destination/type"
      }
    ]
    
    Use realistic prices in INR. Make deals attractive with 15-50% discounts.
    For imageUrl, use real Unsplash URLs like: https://images.unsplash.com/photo-[id]?w=400
    Only return the JSON array, no other text.`;

    console.log('Generating deals for:', destination, 'type:', dealType);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a travel deals API. Return only valid JSON arrays with travel deals. No markdown, no explanations.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Failed to generate deals');
    }

    const data = await response.json();
    let dealsText = data.choices[0].message.content;
    
    // Clean up the response
    dealsText = dealsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const deals = JSON.parse(dealsText);

    return new Response(JSON.stringify({ deals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Deals function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
