
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { code } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'No code provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Analyzing code for YML configuration');

    // Here we'll implement a basic YML detection
    // This is a simple example - you might want to make this more sophisticated
    const detectedImports = Array.from(
      code.matchAll(/import\s+{[^}]+}\s+from\s+['"]([^'"]+)['"]/g)
    ).map(match => match[1]);

    // Create a basic YML structure
    const yml = `
name: Configuration
version: 1.0.0
imports:
${detectedImports.map(imp => `  - ${imp}`).join('\n')}
configurations:
  - type: model
    content: ${JSON.stringify(code)}
`.trim();

    // Process the code (in this example, we're just adding a comment)
    const processedCode = `// Generated configuration\n${code}`;

    console.log('YML configuration generated successfully');

    return new Response(
      JSON.stringify({
        yml,
        imports: detectedImports,
        processedCode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in detect-yml-config:', error);
    return new Response(
      JSON.stringify({ 
        error: `Failed to analyze code: ${error.message}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
