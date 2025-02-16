
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PromptFormValues } from '../hooks/usePromptForm';

interface MessageFieldsProps {
  form: UseFormReturn<PromptFormValues>;
}

export function MessageFields({ form }: MessageFieldsProps) {
  return (
    <>
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
    </>
  );
}
