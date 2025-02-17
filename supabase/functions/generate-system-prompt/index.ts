
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

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { context } = await req.json();

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
            content: `You are an expert in creating highly effective system prompts for AI agents. Your goal is to craft precise, contextual, and well-structured system prompts that will guide AI assistants in providing accurate and relevant responses.

Follow these guidelines when generating system prompts:
1. Be specific about the agent's role and expertise domain
2. Include clear constraints and boundaries
3. Define the expected interaction style and tone
4. Specify the format and structure of responses when relevant
5. Include relevant domain-specific terminology and concepts
6. Set clear ethical guidelines and bias prevention measures
7. Define success criteria for responses
8. Include error handling and edge case considerations`
          },
          {
            role: 'user',
            content: `Create a system prompt based on this context: "${context}"

Your output should follow this structure:
1. Role and Expertise Definition
2. Primary Objectives
3. Interaction Guidelines
4. Response Requirements
5. Constraints and Limitations
6. Success Criteria

Make the prompt concise yet comprehensive, focusing on the specific needs indicated in the context.`
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
