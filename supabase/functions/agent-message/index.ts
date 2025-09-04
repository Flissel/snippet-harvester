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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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
      userContent = prompt.user_message.replace('{message}', message).replace('{input}', message);
    }
    
    messages.push({
      role: 'user',
      content: userContent
    });

    console.log('Using model:', prompt.model || 'gpt-4o-mini');
    console.log('Messages:', JSON.stringify(messages, null, 2));

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: prompt.model || 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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