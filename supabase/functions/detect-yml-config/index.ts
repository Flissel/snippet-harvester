
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
    const { code, systemMessage, userMessage, model = 'gpt-4o-mini' } = await req.json();
    console.log('[detect-yml-config] Received request:', {
      codeLength: code?.length || 0,
      codePreview: code?.substring(0, 100) + '...',
      systemMessageLength: systemMessage?.length || 0,
      userMessageLength: userMessage?.length || 0,
      model,
    });

    if (!code) {
      console.error('[detect-yml-config] No code provided in request');
      throw new Error('No code provided');
    }

    console.log('[detect-yml-config] Preparing OpenAI request with:', {
      model,
      messageCount: 2, // system + user
      totalLength: (systemMessage?.length || 0) + (userMessage?.length || 0),
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemMessage || 'You are an AI assistant that analyzes Python code and generates YML configurations and required imports.'
          },
          {
            role: 'user',
            content: userMessage?.replace('{code}', code) || `Analyze this Python code and provide:
1. A list of required imports
2. A YML configuration that captures all configurable parameters
3. The processed Python code with the configuration applied

Format your response with sections separated by "---":

Required Imports:
<list imports here>
---
YML Configuration:
<yml configuration here>
---
Processed Code:
<processed code here>

Code to analyze:
${code}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('[detect-yml-config] OpenAI API error:', response.statusText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[detect-yml-config] Received OpenAI response:', {
      responseLength: data.choices[0].message.content.length,
      finishReason: data.choices[0].finish_reason,
    });

    const raw_response = data.choices[0].message.content;

    // Parse the response for structured data
    const sections = raw_response.split('---').map(s => s.trim());
    let yml = '', imports: string[] = [], processedCode = '';

    for (const section of sections) {
      if (section.toLowerCase().includes('yml configuration:')) {
        yml = section.split('\n').slice(1).join('\n');
      } else if (section.toLowerCase().includes('required imports:')) {
        imports = section.split('\n').slice(1).filter(Boolean);
      } else if (section.toLowerCase().includes('processed code:')) {
        processedCode = section.split('\n').slice(1).join('\n');
      }
    }

    console.log('[detect-yml-config] Parsed response sections:', {
      ymlLength: yml.length,
      importsCount: imports.length,
      processedCodeLength: processedCode.length,
    });

    return new Response(
      JSON.stringify({
        raw_response,
        yml,
        imports,
        processedCode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[detect-yml-config] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
