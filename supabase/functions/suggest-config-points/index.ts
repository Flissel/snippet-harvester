
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function analyzeCodeIteration(code: string, existingSuggestions: any[] = []): Promise<any[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a specialized AI that analyzes Python code for AutoGen agents and identifies configuration points. Focus on finding:
1. Model configurations (model names, temperature, max_tokens)
2. API keys and credentials
3. Agent configurations (system messages, human input modes)
4. Tool configurations (function names, parameters)
5. Runtime parameters (timeouts, retries)

Also research and provide relevant documentation links, best practices, and example configurations for:
- Similar AutoGen implementations
- Common configuration patterns
- Security best practices
- Performance optimization tips

For each identified point, return a JSON object with:
- label: A clear, descriptive name
- config_type: One of [string, number, boolean, array, object]
- description: A helpful explanation of the configuration point
- default_value: The current value in the code
- template_placeholder: Format as {label} for template substitution
- documentation_links: Array of relevant documentation URLs
- best_practices: Array of recommended best practices
- examples: Array of example configurations

IMPORTANT: Do not suggest configuration points that have already been identified. Here are the existing suggestions:
${JSON.stringify(existingSuggestions, null, 2)}`
          },
          {
            role: 'user',
            content: `Analyze this code and return ONLY a JSON array of NEW configuration points that haven't been suggested before, including research insights. Example format:
[
  {
    "label": "model_name",
    "config_type": "string",
    "description": "The name of the GPT model to use",
    "default_value": "gpt-4",
    "template_placeholder": "{model_name}",
    "documentation_links": [
      "https://microsoft.github.io/autogen/docs/configuration",
      "https://platform.openai.com/docs/models"
    ],
    "best_practices": [
      "Choose models based on task complexity",
      "Consider cost vs performance trade-offs"
    ],
    "examples": [
      "gpt-4",
      "gpt-3.5-turbo"
    ]
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
      console.error('Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array found in response:', content);
      return [];
    }

    const jsonStr = match[0];
    try {
      const newSuggestions = JSON.parse(jsonStr);
      return Array.isArray(newSuggestions) ? newSuggestions : [];
    } catch (error) {
      console.error('Error parsing JSON:', error, 'JSON string:', jsonStr);
      return [];
    }
  } catch (error) {
    console.error('Error in analyzeCodeIteration:', error);
    return [];
  }
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
    const MAX_ITERATIONS = 3;

    while (iterationCount < MAX_ITERATIONS) {
      console.log(`Starting iteration ${iterationCount + 1}...`);
      
      const newSuggestions = await analyzeCodeIteration(code, allSuggestions);
      console.log(`Found ${newSuggestions.length} new suggestions in iteration ${iterationCount + 1}`);
      
      if (newSuggestions.length === 0) {
        console.log('No new suggestions found, stopping iterations');
        break;
      }

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
