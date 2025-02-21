
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Hello from execute-analysis-step!');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      workflowItemId,
      step,
      snippetId,
      analysisType,
      systemMessage,
      userMessage,
      model
    } = await req.json();
    
    console.log('Analyzing step:', step, 'for workflow item:', workflowItemId);

    const ymlAnalysisResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/detect-yml-config`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          snippetId,
          systemMessage,
          userMessage,
          model,
        }),
      }
    );

    const ymlAnalysis = await ymlAnalysisResponse.json();
    console.log('YML analysis complete:', ymlAnalysis);

    return new Response(
      JSON.stringify({
        step_number: step,
        result_data: ymlAnalysis.raw_response, // Just pass through the raw response
        title: 'Code Analysis',
        status: 'completed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in execute-analysis-step:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

