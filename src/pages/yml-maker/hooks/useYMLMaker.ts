
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
    try {
      const { data, error } = await supabase.functions.invoke('detect-yml-config', {
        body: { code: selectedCode },
      });

      if (error) throw error;

      setYmlContent(data.yml);
      setImports(data.imports);
      setProcessedCode(data.processedCode);
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

      // Store in localStorage for now until we update Supabase types
      const configuration = {
        snippet_id: snippet.id,
        config_type: 'model',
        yml_content: ymlContent,
        imports: imports || [],
        processed_code: processedCode || '',
        created_by: user.id,
      };

      localStorage.setItem(`yml_config_${snippet.id}`, JSON.stringify(configuration));
      toast.success('Configuration saved successfully (temporarily in localStorage)');
      
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
