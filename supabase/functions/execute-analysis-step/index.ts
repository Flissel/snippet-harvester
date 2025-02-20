
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
    const { code, prompt, previousResults, step } = await req.json();

    // Prepare context from previous results
    const context = previousResults.map(result => ({
      step: result.step_number,
      data: result.result_data,
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt.system_message,
          },
          {
            role: 'user',
            content: formatPrompt(prompt.user_message, code, context),
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        step,
        result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

function formatPrompt(template: string, code: string, context: any[]): string {
  let prompt = template.replace('{code}', code);
  
  // Add context from previous steps if available
  if (context.length > 0) {
    const contextStr = context
      .map(c => `Step ${c.step} Output:\n${JSON.stringify(c.data, null, 2)}`)
      .join('\n\n');
    prompt = prompt.replace('{context}', contextStr);
  }
  
  return prompt;
}
