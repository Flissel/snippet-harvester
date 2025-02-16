
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function analyzeCodeIteration(code: string, existingSuggestions: any[] = []): Promise<any[]> {
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
- template_placeholder: Format as {label} for template substitution

IMPORTANT: Do not suggest configuration points that have already been identified. Here are the existing suggestions:
${JSON.stringify(existingSuggestions, null, 2)}`
        },
        {
          role: 'user',
          content: `Analyze this code and return ONLY a JSON array of NEW configuration points that haven't been suggested before. Example format:
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

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from OpenAI');
  }

  const content = data.choices[0].message.content.trim();
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) {
    return [];
  }

  const jsonStr = match[0];
  const newSuggestions = JSON.parse(jsonStr);
  return Array.isArray(newSuggestions) ? newSuggestions : [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    console.log('Starting code analysis...');

    const allSuggestions = [];
    let iterationCount = 0;
    const MAX_ITERATIONS = 3; // Limit iterations to prevent infinite loops

    while (iterationCount < MAX_ITERATIONS) {
      console.log(`Starting iteration ${iterationCount + 1}...`);
      
      const newSuggestions = await analyzeCodeIteration(code, allSuggestions);
      console.log(`Found ${newSuggestions.length} new suggestions in iteration ${iterationCount + 1}`);
      
      if (newSuggestions.length === 0) {
        console.log('No new suggestions found, stopping iterations');
        break;
      }

      // Add new suggestions to the collection
      allSuggestions.push(...newSuggestions);
      iterationCount++;
    }

    console.log(`Analysis complete. Found total ${allSuggestions.length} suggestions in ${iterationCount} iterations`);

    return new Response(JSON.stringify({ 
      suggestions: allSuggestions,
      iterations: iterationCount 
    }), {
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
