
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Snippet } from '@/types/snippets';

export function useYMLMaker(snippet: Snippet | null) {
  const [ymlContent, setYmlContent] = useState<string | null>(null);
  const [imports, setImports] = useState<string[] | null>(null);
  const [processedCode, setProcessedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const detectConfigurations = async (selectedCode: string | null) => {
    if (!selectedCode || !snippet) return;

    setIsProcessing(true);
    setYmlContent(null);
    setImports(null);
    setProcessedCode(null);

    try {
      const { data, error } = await supabase.functions.invoke('detect-yml-config', {
        body: { 
          code: selectedCode,
          // The system and user messages will come from the selected prompt
          // in the YMLMaker component
          systemMessage: 'You are an AI assistant that analyzes Python code and generates YML configurations and required imports.',
          userMessage: `Analyze this Python code and provide:
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
{code}`,
          model: 'gpt-4o-mini'
        },
      });

      if (error) throw error;

      if (data.yml) {
        setYmlContent(data.yml);
      }
      if (data.imports) {
        setImports(data.imports);
      }
      if (data.processedCode) {
        setProcessedCode(data.processedCode);
      }

      if (!data.yml && !data.imports && !data.processedCode) {
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (error) {
      console.error('Error detecting configurations:', error);
      toast.error('Failed to detect configurations');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!snippet || !ymlContent) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('yml_configurations')
        .insert({
          snippet_id: snippet.id,
          config_type: 'model',
          yml_content: ymlContent,
          imports: imports || [],
          processed_code: processedCode || '',
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  return {
    ymlContent,
    imports,
    processedCode,
    isProcessing,
    detectConfigurations,
    handleSave,
  };
}
