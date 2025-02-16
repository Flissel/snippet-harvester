
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
    
    console.log('Analyzing code:', code);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a specialized AI that analyzes Python code for AutoGen agents and identifies configuration points. Focus on finding:
1. Model configurations (model names, temperature, max_tokens)
2. API keys and credentials
3. Agent configurations (system messages, human input modes)
4. Tool configurations (function names, parameters)
5. Runtime parameters (timeouts, retries)

For each identified point, return a JSON object with:
- label: A clear, descriptive name
- config_type: One of [string, number, boolean, array, object]
- description: A helpful explanation of the configuration point
- default_value: The current value in the code
- template_placeholder: Format as {label} for template substitution`
          },
          {
            role: 'user',
            content: `Analyze this code and return ONLY a JSON array of configuration points. Example format:
[
  {
    "label": "model_name",
    "config_type": "string",
    "description": "The name of the GPT model to use",
    "default_value": "gpt-3.5-turbo",
    "template_placeholder": "{model_name}"
  }
]

Code to analyze:
${code}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    console.log('OpenAI API response status:', response.status);
    
    const data = await response.json();
    console.log('OpenAI API raw response:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    console.log('OpenAI response content:', content);

    // Try to find JSON array in the content
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array found in content');
      throw new Error('No valid JSON array found in OpenAI response');
    }

    const jsonStr = match[0];
    console.log('Extracted JSON string:', jsonStr);

    let suggestions;
    try {
      suggestions = JSON.parse(jsonStr);
      if (!Array.isArray(suggestions)) {
        throw new Error('Parsed result is not an array');
      }
      console.log('Successfully parsed suggestions:', suggestions);
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error in suggest-config-points function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});
