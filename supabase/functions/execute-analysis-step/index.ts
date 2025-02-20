
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workflowItemId, step, snippetId, analysisType } = await req.json();

    if (!workflowItemId || !snippetId) {
      throw new Error('Workflow item ID and snippet ID are required');
    }

    // Get the snippet's code content
    const { data: snippet, error: snippetError } = await supabaseClient
      .from('snippets')
      .select('code_content')
      .eq('id', snippetId)
      .single();

    if (snippetError) throw snippetError;
    if (!snippet) throw new Error('Snippet not found');

    // Get the workflow item to access the prompt information
    const { data: workflowItem, error: workflowError } = await supabaseClient
      .from('workflow_items')
      .select('*')
      .eq('id', workflowItemId)
      .single();

    if (workflowError) throw workflowError;
    if (!workflowItem) throw new Error('Workflow item not found');

    // Call detect-yml-config to get the OpenAI analysis
    const { data: ymlAnalysis, error: ymlError } = await supabaseClient.functions.invoke('detect-yml-config', {
      body: { 
        code: snippet.code_content,
        systemMessage: "You are an AI assistant that analyzes code and generates YML configurations.",
        userMessage: "Analyze this code and generate a YML configuration that captures all configurable parameters.",
        model: 'gpt-4o-mini'
      },
    });

    if (ymlError) throw ymlError;

    console.log('YML Analysis completed:', ymlAnalysis);

    // Return only the YML configuration part
    return new Response(
      JSON.stringify({
        step_number: step,
        result_data: {
          yml_config: ymlAnalysis.yml || 'No YML configuration generated'
        },
        title: 'YML Configuration',
        status: 'completed',
        created_at: new Date().toISOString()
      }),
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
      JSON.stringify({ 
        error: error.message,
        status: 'failed',
        created_at: new Date().toISOString()
      }),
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
