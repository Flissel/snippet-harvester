
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Prompt } from '@/types/prompts';

interface GenerationSettings {
  role?: string;
  guidelines?: string;
  structure?: string;
}

const promptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  system_message: z.string().min(1, 'System message is required'),
  user_message: z.string().min(1, 'User message is required'),
  prompt_generation_role: z.string().optional(),
  prompt_generation_guidelines: z.string().optional(),
  prompt_generation_structure: z.string().optional(),
});

export type PromptFormValues = z.infer<typeof promptSchema>;

export function usePromptForm(prompt: Prompt | undefined, onSuccess: () => void) {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: prompt || {
      name: '',
      description: '',
      system_message: '',
      user_message: '',
      prompt_generation_role: '',
      prompt_generation_guidelines: '',
      prompt_generation_structure: '',
    },
  });

  const generateSystemMessage = async (
    title: string, 
    description?: string, 
    settings?: GenerationSettings
  ) => {
    try {
      const context = `Title: ${title}${description ? `\nDescription: ${description}` : ''}`;
      
      const response = await supabase.functions.invoke('generate-system-prompt', {
        body: { 
          context,
          settings
        }
      });
      
      if (response.data?.systemPrompt) {
        form.setValue('system_message', response.data.systemPrompt);
      } else {
        throw new Error('No system prompt generated');
      }
    } catch (error) {
      console.error('Error generating system message:', error);
      toast.error('Failed to generate system message');
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: PromptFormValues) => {
      if (!userId) throw new Error('No user found');

      const promptData = {
        name: values.name,
        description: values.description || null,
        system_message: values.system_message,
        user_message: values.user_message,
        created_by: userId,
        model: 'gpt-4o',
        prompt_generation_role: values.prompt_generation_role || null,
        prompt_generation_guidelines: values.prompt_generation_guidelines || null,
        prompt_generation_structure: values.prompt_generation_structure || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (prompt) {
        const { error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', prompt.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prompts')
          .insert([promptData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success(prompt ? 'Prompt updated successfully' : 'Prompt created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to ${prompt ? 'update' : 'create'} prompt: ` + error.message);
    },
  });

  return {
    form,
    generateSystemMessage,
    onSubmit: (values: PromptFormValues) => mutation.mutate(values),
  };
}
