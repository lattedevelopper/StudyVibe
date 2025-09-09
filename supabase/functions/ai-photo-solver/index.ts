import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { image, prompt } = await req.json();

    if (!image || !prompt) {
      throw new Error('Image and prompt are required');
    }

    const PROXYAPI_KEY = Deno.env.get('PROXYAPI_KEY');
    if (!PROXYAPI_KEY) {
      throw new Error('PROXYAPI_KEY is not set');
    }

    // Extract base64 data from image URL
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PROXYAPI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Вы - эксперт по решению математических, физических и химических задач. Анализируйте изображение с задачей и предоставьте четкое решение на русском языке.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ProxyAPI Error:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;

    if (!solution) {
      throw new Error('No solution received from AI');
    }

    return new Response(
      JSON.stringify({ 
        solution,
        confidence: 0.85 // Mock confidence score
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-photo-solver function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});