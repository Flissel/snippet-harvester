
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnalysisSession, AnalysisResult, PromptType } from '@/types/analysis';
import { Snippet } from '@/types/snippets';
import { Prompt } from '@/types/prompts';

export function useAnalysisProcess(snippet: Snippet | null) {
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();

  // Fetch available prompts for each step
  const { data: prompts } = useQuery({
    queryKey: ['analysis-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .not('prompt_type', 'is', null);
      
      if (error) throw error;
      return data as Prompt[];
    },
  });

  // Fetch or create analysis session
  const { data: session } = useQuery({
    queryKey: ['analysis-session', snippet?.id],
    enabled: !!snippet,
    queryFn: async () => {
      const { data: existingSession } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('snippet_id', snippet?.id)
        .eq('status', 'in_progress')
        .single();

      if (existingSession) return existingSession;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newSession, error } = await supabase
        .from('analysis_sessions')
        .insert({
          snippet_id: snippet?.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newSession;
    },
  });

  // Fetch results for the current session
  const { data: results } = useQuery({
    queryKey: ['analysis-results', session?.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('session_id', session?.id)
        .order('step_number', { ascending: true });

      if (error) throw error;
      return data as AnalysisResult[];
    },
  });

  // Execute analysis step
  const executeStep = async (prompt: Prompt, code: string, previousResults: AnalysisResult[] = []) => {
    if (!session || !snippet) return;

    const { data, error } = await supabase.functions.invoke('execute-analysis-step', {
      body: {
        code,
        prompt,
        previousResults,
        step: currentStep,
      },
    });

    if (error) throw error;
    return data;
  };

  // Mutation for saving step results
  const saveResultMutation = useMutation({
    mutationFn: async (result: any) => {
      if (!session) throw new Error('No active session');

      const { error } = await supabase
        .from('analysis_results')
        .insert({
          session_id: session.id,
          prompt_id: result.prompt_id,
          step_number: currentStep,
          result_data: result.data,
        });

      if (error) throw error;

      // Update session progress
      await supabase
        .from('analysis_sessions')
        .update({ current_step: currentStep + 1 })
        .eq('id', session.id);

      setCurrentStep(prev => prev + 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-results'] });
      toast.success('Analysis step completed successfully');
    },
    onError: (error) => {
      toast.error('Failed to save analysis result: ' + error.message);
    },
  });

  // Process next step
  const processNextStep = async (code: string) => {
    if (!prompts || !session) return;

    const currentPrompt = prompts.find(p => 
      p.prompt_type && currentStep === getStepNumberForType(p.prompt_type as PromptType)
    );

    if (!currentPrompt) {
      toast.error('No prompt found for current step');
      return;
    }

    try {
      const result = await executeStep(currentPrompt, code, results || []);
      await saveResultMutation.mutateAsync({
        prompt_id: currentPrompt.id,
        data: result,
      });
    } catch (error) {
      toast.error('Failed to process step: ' + (error as Error).message);
    }
  };

  const getStepNumberForType = (type: PromptType): number => {
    const stepMap: Record<PromptType, number> = {
      'yml_maker': 1,
      'import_analyzer': 2,
      'component_builder': 3,
      'code_merger': 4,
    };
    return stepMap[type];
  };

  return {
    currentStep,
    session,
    results,
    processNextStep,
    isProcessing: saveResultMutation.isPending,
  };
}
