
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
      return data as (Prompt & { prompt_type: PromptType })[];
    },
  });

  // Fetch or create analysis session
  const { data: session } = useQuery({
    queryKey: ['analysis-session', snippet?.id],
    enabled: !!snippet,
    queryFn: async () => {
      // Explicitly type the database response
      type DBSession = {
        id: string;
        snippet_id: string;
        created_at: string;
        updated_at: string;
        created_by: string;
        status: string;
        current_step: number;
        metadata: Record<string, any>;
      };

      const { data: existingSession } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('snippet_id', snippet?.id)
        .eq('status', 'in_progress')
        .single();

      if (existingSession) return existingSession as DBSession;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newSession, error } = await supabase
        .from('analysis_sessions')
        .insert({
          snippet_id: snippet?.id,
          created_by: user.id,
          status: 'in_progress',
          current_step: 1,
          metadata: {},
        } as DBSession)
        .select()
        .single();

      if (error) throw error;
      return newSession as DBSession;
    },
  });

  // Fetch results for the current session
  const { data: results } = useQuery({
    queryKey: ['analysis-results', session?.id],
    enabled: !!session,
    queryFn: async () => {
      type DBResult = {
        id: string;
        session_id: string;
        prompt_id: string;
        step_number: number;
        result_data: Record<string, any>;
        created_at: string;
      };

      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('session_id', session?.id)
        .order('step_number', { ascending: true });

      if (error) throw error;
      return data as DBResult[];
    },
  });

  // Execute analysis step
  const executeStep = async (prompt: Prompt & { prompt_type: PromptType }, code: string, previousResults: AnalysisResult[] = []) => {
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
    mutationFn: async (result: { prompt_id: string; data: Record<string, any> }) => {
      if (!session) throw new Error('No active session');

      const { error: resultError } = await supabase
        .from('analysis_results')
        .insert({
          session_id: session.id,
          prompt_id: result.prompt_id,
          step_number: currentStep,
          result_data: result.data,
        });

      if (resultError) throw resultError;

      // Update session progress
      const { error: sessionError } = await supabase
        .from('analysis_sessions')
        .update({ 
          current_step: currentStep + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (sessionError) throw sessionError;

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
      p.prompt_type && currentStep === getStepNumberForType(p.prompt_type)
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
