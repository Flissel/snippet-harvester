
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT_TEMPLATE = `
You are an AI assistant that creates system messages based on structured descriptions.

Given a description with sections:
- PURPOSE: Main objective
- INPUT: Expected input format/type
- OUTPUT: Required output format/type
- EXAMPLE: Reference output
- CONSIDERATIONS (optional): Special rules

Create a comprehensive system message that:
1. Defines clear role and purpose
2. Specifies input handling requirements
3. Enforces output format requirements
4. Uses the example as reference
5. Incorporates any considerations as constraints

The generated system message should be concise but complete.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, settings } = await req.json();

    if (!context) {
      return new Response(
        JSON.stringify({ error: 'Context is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating system prompt with context:', context);
    console.log('Using custom settings:', settings);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings?.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT_TEMPLATE
          },
          {
            role: 'user',
            content: `Create a system message based on this structured description:\n\n${context}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI API');
    }

    console.log('Generated system prompt:', data.choices[0].message.content);

    return new Response(
      JSON.stringify({ 
        systemPrompt: data.choices[0].message.content,
        status: 'success'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in generate-system-prompt function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        status: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
