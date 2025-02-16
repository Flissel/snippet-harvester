
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Prompt } from '@/types/prompts';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const promptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  system_message: z.string().min(1, 'System message is required'),
  user_message: z.string().min(1, 'User message is required'),
  is_default: z.boolean().default(false),
});

type PromptFormValues = z.infer<typeof promptSchema>;

interface PromptFormProps {
  prompt?: Prompt;
  onCancel: () => void;
}

export function PromptForm({ prompt, onCancel }: PromptFormProps) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { snippetId } = useParams();
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();

    // If we're creating a new prompt, fetch the suggested system message
    if (!prompt && snippetId) {
      fetchSuggestedSystemMessage();
    }
  }, []);

  const fetchSuggestedSystemMessage = async () => {
    try {
      const { data: snippetData } = await supabase
        .from('snippets')
        .select('code')
        .eq('id', snippetId)
        .single();

      if (snippetData?.code) {
        const response = await supabase.functions.invoke('suggest-config-points', {
          body: { code: snippetData.code }
        });

        if (response.data?.suggestions) {
          const systemMessage = generateSystemMessage(response.data.suggestions);
          form.setValue('system_message', systemMessage);
        }
      }
    } catch (error) {
      console.error('Error fetching suggested system message:', error);
      toast.error('Failed to fetch configuration suggestions');
    }
  };

  const generateSystemMessage = (suggestions: any[]) => {
    return `You are a specialized AI that analyzes Python code for AutoGen agents and identifies configuration points. Focus on finding:

1. Model configurations (model names, temperature, max_tokens)
2. API keys and credentials
3. Agent configurations (system messages, human input modes)
4. Tool configurations (function names, parameters)
5. Runtime parameters (timeouts, retries)

For each identified point, provide:
${suggestions.map(suggestion => `
- ${suggestion.label}: ${suggestion.description}
  Type: ${suggestion.config_type}
  Default: ${suggestion.default_value}
  Best Practices:
    ${suggestion.best_practices?.join('\n    ')}
`).join('\n')}

Documentation References:
${suggestions.flatMap(s => s.documentation_links || []).filter((v, i, a) => a.indexOf(v) === i).join('\n')}`;
  };

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
      onCancel();
    },
    onError: (error) => {
      toast.error(`Failed to ${prompt ? 'update' : 'create'} prompt: ` + error.message);
    },
  });

  function onSubmit(values: PromptFormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter prompt name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="system_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter system message"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter user message"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Set as Default
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this prompt the default for analysis
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {prompt ? 'Update' : 'Create'} Prompt
          </Button>
        </div>
      </form>
    </Form>
  );
}
