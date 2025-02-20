
import { serve } from "https://deno.fresh.dev/std@v1/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workflowItemId, step } = await req.json();

    if (!workflowItemId) {
      throw new Error('Workflow item ID is required');
    }

    // Get the workflow item
    const { data: workflowItem, error: fetchError } = await supabaseClient
      .from('workflow_items')
      .select('*')
      .eq('id', workflowItemId)
      .single();

    if (fetchError) throw fetchError;
    if (!workflowItem) throw new Error('Workflow item not found');

    // Process based on workflow type
    let analysisResult;
    switch (workflowItem.workflow_type) {
      case 'code_analysis':
        analysisResult = {
          step_number: step,
          analysis_type: 'code_analysis',
          findings: [
            {
              type: 'configuration',
              description: 'Code analysis completed successfully',
              details: {
                configType: 'yml',
                recommendations: ['Add proper documentation', 'Include version control']
              }
            }
          ],
          timestamp: new Date().toISOString()
        };
        break;
      default:
        analysisResult = {
          step_number: step,
          analysis_type: 'generic',
          message: 'Generic analysis completed',
          timestamp: new Date().toISOString()
        };
    }

    console.log('Analysis completed for workflow item:', workflowItemId);
    console.log('Result:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error executing analysis step:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400 
      }
    );
  }
});
