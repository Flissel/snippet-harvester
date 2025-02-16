
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Prompt } from '@/types/prompts';

const promptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  system_message: z.string().min(1, 'System message is required'),
  user_message: z.string().min(1, 'User message is required'),
  is_default: z.boolean().default(false),
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
      is_default: false,
    },
  });

  const generateSystemMessage = async () => {
    try {
      const response = await supabase.functions.invoke('generate-system-prompt', {});
      
      if (response.data?.system_prompt) {
        form.setValue('system_message', response.data.system_prompt);
      } else {
        throw new Error('No system prompt generated');
      }
    } catch (error) {
      console.error('Error generating system message:', error);
      toast.error('Failed to generate system message');
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: PromptFormValues) => {
      if (!userId) throw new Error('No user found');

      if (prompt) {
        const { error } = await supabase
          .from('prompts')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prompt.id);
        if (error) throw error;
      } else {
        const newPrompt = {
          name: values.name,
          description: values.description || null,
          system_message: values.system_message,
          user_message: values.user_message,
          is_default: values.is_default,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('prompts')
          .insert([newPrompt]);
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
