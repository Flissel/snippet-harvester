
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

    const { workflowItemId, step, snippetId } = await req.json();
    console.log('[execute-analysis-step] Received request:', { workflowItemId, step, snippetId });

    if (!workflowItemId || !snippetId) {
      throw new Error('Workflow item ID and snippet ID are required');
    }

    // Get the snippet's code content
    const { data: snippet, error: snippetError } = await supabaseClient
      .from('snippets')
      .select('code_content')
      .eq('id', snippetId)
      .single();

    if (snippetError) {
      console.error('[execute-analysis-step] Error fetching snippet:', snippetError);
      throw snippetError;
    }
    if (!snippet) {
      console.error('[execute-analysis-step] Snippet not found:', snippetId);
      throw new Error('Snippet not found');
    }

    console.log('[execute-analysis-step] Retrieved snippet:', {
      id: snippetId,
      codeLength: snippet.code_content?.length || 0,
      codePreview: snippet.code_content?.substring(0, 100) + '...',
    });

    // Get the workflow item to access the prompt information
    const { data: workflowItem, error: workflowError } = await supabaseClient
      .from('workflow_items')
      .select('*')
      .eq('id', workflowItemId)
      .single();

    if (workflowError) {
      console.error('[execute-analysis-step] Error fetching workflow item:', workflowError);
      throw workflowError;
    }
    if (!workflowItem) {
      console.error('[execute-analysis-step] Workflow item not found:', workflowItemId);
      throw new Error('Workflow item not found');
    }

    console.log('[execute-analysis-step] Retrieved workflow item:', {
      id: workflowItem.id,
      type: workflowItem.workflow_type,
      analysisType: workflowItem.analysis_type,
      systemMessageLength: workflowItem.system_message?.length || 0,
      userMessageLength: workflowItem.user_message?.length || 0,
      model: workflowItem.model,
    });

    // Prepare request body for detect-yml-config
    const requestBody = { 
      code: snippet.code_content,
      systemMessage: workflowItem.system_message || "You are an AI assistant that analyzes code and generates YML configurations.",
      userMessage: (workflowItem.user_message || "Analyze this code and generate a YML configuration that captures all configurable parameters.").replace('{code}', snippet.code_content),
      model: workflowItem.model || 'gpt-4o-mini'
    };

    console.log('[execute-analysis-step] Calling detect-yml-config with:', {
      codeLength: requestBody.code?.length || 0,
      systemMessageLength: requestBody.systemMessage?.length || 0,
      userMessageLength: requestBody.userMessage?.length || 0,
      model: requestBody.model,
    });

    // Call detect-yml-config with the proper prompt information
    const { data: ymlAnalysis, error: ymlError } = await supabaseClient.functions.invoke('detect-yml-config', {
      body: requestBody,
    });

    if (ymlError) {
      console.error('[execute-analysis-step] Error from detect-yml-config:', ymlError);
      throw ymlError;
    }

    console.log('[execute-analysis-step] YML Analysis completed:', {
      hasYml: !!ymlAnalysis?.yml,
      ymlLength: ymlAnalysis?.yml?.length || 0,
      importsCount: ymlAnalysis?.imports?.length || 0,
      processedCodeLength: ymlAnalysis?.processedCode?.length || 0,
    });

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
    console.error('[execute-analysis-step] Error executing analysis step:', error);
    
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
