
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating system prompts for code analysis AI. You create clear, structured prompts that guide AI models to analyze code effectively.'
          },
          {
            role: 'user',
            content: `Create a system prompt for an AI that will analyze Python code, specifically focusing on AutoGen agents. The prompt should guide the AI to:

1. Identify and analyze configuration points including:
   - Model configurations (names, temperature, tokens)
   - API keys and credentials
   - Agent configurations
   - Tool configurations
   - Runtime parameters

2. For each configuration point found, provide:
   - A clear description
   - The configuration type
   - Default values
   - Best practices
   - Relevant documentation links

Format the response as a clear, structured system prompt that can be directly used with GPT models.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const systemPrompt = data.choices[0].message.content;

    return new Response(JSON.stringify({ system_prompt: systemPrompt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
