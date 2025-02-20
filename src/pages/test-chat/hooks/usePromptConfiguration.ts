
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Prompt, PromptModel } from '@/types/prompts';
import { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function usePromptConfiguration(user: User | null) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [systemMessage, setSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      setSystemMessage(selectedPrompt.system_message);
      setUserMessage(selectedPrompt.user_message || '');
      setHasUnsavedChanges(false);
    }
  }, [selectedPrompt]);

  useEffect(() => {
    if (selectedPrompt) {
      const hasChanges = 
        systemMessage !== selectedPrompt.system_message ||
        userMessage !== selectedPrompt.user_message;
      setHasUnsavedChanges(hasChanges);
    }
  }, [systemMessage, userMessage, selectedPrompt]);

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the model field to PromptModel type
      const typedPrompts = (data || []).map(prompt => ({
        ...prompt,
        model: prompt.model as PromptModel
      }));
      
      setPrompts(typedPrompts);
      
      if (typedPrompts.length > 0) {
        setSelectedPrompt(typedPrompts[0]);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!user || !selectedPrompt) return false;

    try {
      const { data, error } = await supabase
        .from('prompt_configurations')
        .insert({
          name: `${selectedPrompt.name} - Configuration`,
          system_message: systemMessage,
          user_message: userMessage,
          model: selectedPrompt.model,
          created_by: user.id,
          yaml_template: selectedPrompt.yaml_template,
          description: `Configuration based on prompt: ${selectedPrompt.name}`,
          is_finalized: true
        })
        .select()
        .single();

      if (error) throw error;

      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['saved-configurations'] });
      
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });

      return true;
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
      return false;
    }
  };

  const loadConfiguration = (config: Prompt) => {
    setSelectedPrompt(config);
    setSystemMessage(config.system_message);
    setUserMessage(config.user_message || '');
    setHasUnsavedChanges(false);
    toast({
      title: "Success",
      description: "Configuration loaded successfully",
    });
  };

  return {
    prompts,
    selectedPrompt,
    isLoading,
    systemMessage,
    setSystemMessage,
    userMessage,
    setUserMessage,
    hasUnsavedChanges,
    setSelectedPrompt,
    saveConfiguration,
    loadConfiguration
  };
}
