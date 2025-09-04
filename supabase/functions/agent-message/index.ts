import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // COMPREHENSIVE DEBUGGING - Log everything
    console.log('=== EDGE FUNCTION DEBUGGING START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Test basic functionality first
    const testMode = req.url.includes('test=true');
    if (testMode) {
      console.log('TEST MODE: Returning simple response');
      return new Response(JSON.stringify({ 
        response: 'Test response - Edge Function is working!',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Debug: Log all available environment variables
    const envVars = Object.keys(Deno.env.toObject());
    console.log('Available env vars:', envVars);
    console.log('Total env vars count:', envVars.length);
    
    // Try both possible API key names
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
    console.log('Checking OPENAI_API_KEY:', !!Deno.env.get('OPENAI_API_KEY'));
    console.log('Checking OPEN_AI_KEY:', !!Deno.env.get('OPEN_AI_KEY'));
    console.log('Final OpenAI API key exists:', !!openAIApiKey);
    console.log('OpenAI API key length:', openAIApiKey?.length || 0);
    console.log('OpenAI API key first 10 chars:', openAIApiKey?.substring(0, 10) || 'N/A');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      const errorResponse = { 
        error: 'OpenAI API key not configured',
        response: 'Entschuldigung, der OpenAI API-Schlüssel ist nicht konfiguriert. Bitte wenden Sie sich an den Administrator.',
        debug: {
          availableEnvVars: envVars,
          timestamp: new Date().toISOString()
        }
      };
      console.log('Returning error response:', errorResponse);
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, prompt, chatHistory } = await req.json();

    if (!message || !prompt) {
      throw new Error('Message and prompt are required');
    }

    // Build messages array for OpenAI
    const messages = [];
    
    // Add system message from prompt
    if (prompt.system_message) {
      messages.push({
        role: 'system',
        content: prompt.system_message
      });
    }

    // Add chat history
    if (chatHistory && Array.isArray(chatHistory)) {
      messages.push(...chatHistory);
    }

    // Add current user message with user_message template if provided
    let userContent = message;
    if (prompt.user_message && prompt.user_message.trim()) {
      // Replace placeholder with actual message
      userContent = prompt.user_message.replace(/\{message\}/g, message).replace(/\{input\}/g, message);
    }
    
    messages.push({
      role: 'user',
      content: userContent
    });

    const modelToUse = prompt.model || 'gpt-4o-mini';
    console.log('Using model:', modelToUse);
    console.log('Messages count:', messages.length);

    // Determine if we're using a newer model that needs max_completion_tokens
    const isNewerModel = modelToUse.includes('gpt-5') || modelToUse.includes('gpt-4.1') || modelToUse.includes('o3') || modelToUse.includes('o4');
    
    const requestBody: any = {
      model: modelToUse,
      messages: messages,
      stream: true,
    };

    if (isNewerModel) {
      requestBody.max_completion_tokens = 2000;
      // Newer models don't support temperature
    } else {
      requestBody.temperature = 0.7;
      requestBody.max_tokens = 2000;
    }

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    // Create a streaming response using Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No response body');
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                
                if (data === '[DONE]') {
                  controller.enqueue(`data: [DONE]\n\n`);
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content;
                    controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                  }
                } catch (parseError) {
                  // Ignore parsing errors for malformed chunks
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in agent-message function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Nachricht. Bitte versuchen Sie es erneut.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});