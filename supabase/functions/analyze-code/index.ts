
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_ANALYSIS_CONFIG = {
  analyzers: {
    overview: true,
    components: true,
    issues: true,
    dependencies: true,
    documentation: true,
    complexity: false,
    security: false,
    performance: false,
  },
  depth: 'standard', // 'basic' | 'standard' | 'detailed'
  style: 'technical', // 'simple' | 'technical' | 'comprehensive'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if OpenAI API key is set
  if (!openAIApiKey) {
    console.error('OpenAI API key is not set');
    return new Response(
      JSON.stringify({ 
        error: 'OpenAI API key is not configured. Please contact your administrator.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { code, language, config = {} } = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: 'Code and language are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Analyzing ${language} code with custom configuration...`);

    const analysisConfig = { ...DEFAULT_ANALYSIS_CONFIG, ...config };
    
    const generateSystemPrompt = (config: typeof DEFAULT_ANALYSIS_CONFIG) => {
      const sections = [];
      
      sections.push('You are an expert code analyzer. Analyze the provided code and explain:');
      
      if (config.analyzers.overview) {
        sections.push('1. What the code does (overview)');
      }
      
      if (config.analyzers.components) {
        sections.push('2. Key components and their purposes');
      }
      
      if (config.analyzers.issues) {
        sections.push('3. Potential issues or improvements');
      }
      
      if (config.analyzers.dependencies) {
        sections.push('4. Dependencies and relationships');
      }
      
      if (config.analyzers.documentation) {
        sections.push('5. Documentation suggestions');
      }
      
      if (config.analyzers.complexity) {
        sections.push('6. Code complexity analysis');
      }
      
      if (config.analyzers.security) {
        sections.push('7. Security considerations');
      }
      
      if (config.analyzers.performance) {
        sections.push('8. Performance analysis');
      }

      sections.push(`\nProvide a ${config.depth} analysis with ${config.style} explanations.`);
      
      return sections.join('\n');
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: generateSystemPrompt(analysisConfig) },
          { role: 'user', content: `Language: ${language}\n\nCode:\n${code}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ analysis: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-code function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Analysis failed: ${error.message}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
