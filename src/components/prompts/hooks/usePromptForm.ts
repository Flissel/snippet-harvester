
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Prompt, PromptModel, PromptDescription } from '@/types/prompts';

interface GenerationSettings {
  role?: string;
  guidelines?: string;
  structure?: string;
}

const promptDescriptionSchema = z.object({
  purpose: z.string().min(1, 'Purpose is required'),
  input: z.string().min(1, 'Input is required'),
  output: z.string().min(1, 'Output is required'),
  example: z.string().min(1, 'Example is required'),
  considerations: z.string().optional(),
});

const promptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description_structured: promptDescriptionSchema,
  system_message: z.string().min(1, 'System message is required'),
  user_message: z.string().optional(),
  prompt_generation_role: z.string().optional(),
  prompt_generation_guidelines: z.string().optional(),
  prompt_generation_structure: z.string().optional(),
  model: z.enum(['gpt-4o-mini', 'gpt-4o']).default('gpt-4o-mini'),
});

export type PromptFormValues = z.infer<typeof promptSchema>;

// Ensure all required fields have default values
const DEFAULT_DESCRIPTION: PromptDescription = {
  purpose: '',
  input: '',
  output: '',
  example: '',
  considerations: '',
};

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

  const parseExistingDescription = (description?: string): PromptDescription => {
    if (!description) return DEFAULT_DESCRIPTION;

    const sections = description.split('\n');
    const result: PromptDescription = { ...DEFAULT_DESCRIPTION };

    sections.forEach(section => {
      if (section.startsWith('PURPOSE:')) {
        result.purpose = section.substring('PURPOSE:'.length).trim();
      } else if (section.startsWith('INPUT:')) {
        result.input = section.substring('INPUT:'.length).trim();
      } else if (section.startsWith('OUTPUT:')) {
        result.output = section.substring('OUTPUT:'.length).trim();
      } else if (section.startsWith('EXAMPLE:')) {
        result.example = section.substring('EXAMPLE:'.length).trim();
      } else if (section.startsWith('CONSIDERATIONS:')) {
        result.considerations = section.substring('CONSIDERATIONS:'.length).trim();
      }
    });

    return result;
  };

  const defaultValues: PromptFormValues = {
    name: '',
    description_structured: DEFAULT_DESCRIPTION,
    system_message: '',
    user_message: '',
    prompt_generation_role: '',
    prompt_generation_guidelines: '',
    prompt_generation_structure: '',
    model: 'gpt-4o-mini',
    ...(prompt && {
      ...prompt,
      description_structured: parseExistingDescription(prompt.description),
      model: prompt.model as PromptModel,
    })
  };

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues,
  });

  const generateSystemMessage = async (
    title: string, 
    description: PromptDescription, 
    settings?: GenerationSettings
  ) => {
    try {
      const descriptionText = [
        `PURPOSE: ${description.purpose}`,
        `INPUT: ${description.input}`,
        `OUTPUT: ${description.output}`,
        `EXAMPLE: ${description.example}`,
        description.considerations ? `CONSIDERATIONS: ${description.considerations}` : ''
      ].filter(Boolean).join('\n');

      const context = `Title: ${title}\nDescription: ${descriptionText}`;
      
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

      const descriptionText = [
        `PURPOSE: ${values.description_structured.purpose}`,
        `INPUT: ${values.description_structured.input}`,
        `OUTPUT: ${values.description_structured.output}`,
        `EXAMPLE: ${values.description_structured.example}`,
        values.description_structured.considerations ? `CONSIDERATIONS: ${values.description_structured.considerations}` : ''
      ].filter(Boolean).join('\n');

      const promptData = {
        name: values.name,
        description: descriptionText,
        system_message: values.system_message,
        user_message: values.user_message || null,
        created_by: userId,
        model: values.model as PromptModel,
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
