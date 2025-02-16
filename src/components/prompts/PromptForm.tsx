
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
      if (prompt) {
        const { error } = await supabase
          .from('prompts')
          .update(values)
          .eq('id', prompt.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prompts')
          .insert([values]);
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
