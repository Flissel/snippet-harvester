
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Prompt } from '@/types/prompts';
import { User } from '@supabase/supabase-js';

export function usePromptConfiguration(user: User | null) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [systemMessage, setSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      setSystemMessage(selectedPrompt.system_message);
      setUserMessage(selectedPrompt.user_message);
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
      setPrompts(data || []);
      
      const defaultPrompt = data?.find(p => p.is_default);
      if (defaultPrompt) {
        setSelectedPrompt(defaultPrompt);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!user || !selectedPrompt) return;

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
    saveConfiguration
  };
}
