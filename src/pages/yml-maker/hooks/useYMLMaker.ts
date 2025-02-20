
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Snippet } from '@/types/snippets';
import { Prompt } from '@/types/prompts';

export interface ResponseSection {
  title: string;
  content: string;
}

interface UseYMLMakerProps {
  snippet: Snippet | null;
  selectedPrompt: Prompt | null;
}

export function useYMLMaker({ snippet, selectedPrompt }: UseYMLMakerProps) {
  const [sections, setSections] = useState<ResponseSection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [results, setResults] = useState<any[]>([]);

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
  };

  const detectConfigurations = async (code: string | null) => {
    if (!code || !snippet) return;

    setIsProcessing(true);
    setSections([]);

    try {
      const { data, error } = await supabase.functions.invoke('detect-yml-config', {
        body: { 
          code,
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

      if (data.raw_response) {
        const parsedSections = data.raw_response
          .split('---')
          .map(section => {
            const [title, ...contentLines] = section.trim().split('\n');
            return {
              title: title.trim(),
              content: contentLines.join('\n').trim()
            };
          })
          .filter(section => section.title && section.content);

        setSections(parsedSections);
      }
    } catch (error) {
      console.error('Error detecting configurations:', error);
      toast.error('Failed to detect configurations');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!snippet || sections.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ymlSection = sections.find(s => s.title.toLowerCase().includes('yml configuration'));
      const importsSection = sections.find(s => s.title.toLowerCase().includes('required imports'));
      const codeSection = sections.find(s => s.title.toLowerCase().includes('processed code'));

      const { error } = await supabase
        .from('yml_configurations')
        .insert({
          snippet_id: snippet.id,
          config_type: 'model',
          yml_content: ymlSection?.content || '',
          imports: importsSection ? importsSection.content.split('\n').filter(Boolean) : [],
          processed_code: codeSection?.content || '',
          created_by: user.id,
        });

      if (error) throw error;
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleAddToWorkflow = async () => {
    if (!selectedCode || !selectedPrompt) {
      toast.error('Please select code and a prompt first');
      return;
    }
    await detectConfigurations(selectedCode);
  };

  const handleStartWorkflow = async () => {
    setCurrentStep(1);
    setResults([]);
    if (selectedCode) {
      await detectConfigurations(selectedCode);
    }
  };

  return {
    workflow: {
      sections,
      selectedCode,
      currentStep,
      results,
      handleCodeChange,
    },
    isProcessing,
    handleAddToWorkflow,
    handleStartWorkflow,
    handleSave,
  };
}
