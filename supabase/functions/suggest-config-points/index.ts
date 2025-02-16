
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    const { code } = await req.json();
    
    console.log('Analyzing code:', code); // Add logging

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Fixed model name
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes Python code related to AutoGen agents and identifies configurable parameters. For each identified parameter:
            1. Find a value in the code that should be configurable (like API keys, model names, agent names, etc.)
            2. Determine its type (string, number, boolean, array, object)
            3. Create a descriptive label
            4. Suggest a helpful description
            5. Include the exact default value from the code
            6. Create a template placeholder

            Respond in a JSON array format like this:
            [
              {
                "label": "human_name",
                "config_type": "string",
                "description": "Name for the human agent in the conversation",
                "default_value": "Human",
                "template_placeholder": "{human_name}"
              }
            ]`
          },
          {
            role: 'user',
            content: `Analyze this AutoGen code and suggest configuration points:\n${code}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    console.log('OpenAI response status:', response.status); // Add logging

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response:', data); // Add logging
      throw new Error('Invalid response from OpenAI');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(suggestions)) {
        throw new Error('Invalid suggestions format');
      }
      console.log('Parsed suggestions:', suggestions); // Add logging
    } catch (error) {
      console.error('Failed to parse suggestions:', error);
      throw new Error('Failed to parse configuration suggestions');
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error in suggest-config-points function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});
