
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurationPointInput } from '@/types/configuration';
import { Snippet } from '@/types/snippets';
import { TypeSelector } from './config-form/TypeSelector';
import { CodeInput } from './config-form/CodeInput';
import { RequiredToggle } from './config-form/RequiredToggle';
import { configPointSchema, ConfigPointFormValues } from './config-form/schema';

interface ConfigurationPointFormProps {
  snippet: Snippet;
  onSubmit: (data: ConfigurationPointInput) => void;
  selectedCode?: string;
}

export function ConfigurationPointForm({ 
  snippet, 
  onSubmit,
  selectedCode 
}: ConfigurationPointFormProps) {
  const form = useForm<ConfigPointFormValues>({
    resolver: zodResolver(configPointSchema),
    defaultValues: {
      label: '',
      config_type: 'string',
      default_value: selectedCode ?? '',
      description: '',
      template_placeholder: '',
      is_required: true,
    },
  });

  const handleSubmit = (data: ConfigPointFormValues) => {
    const configPoint: ConfigurationPointInput = {
      ...data,
      snippet_id: snippet.id,
      template_placeholder: data.template_placeholder || `{${data.label}}`,
    };
    onSubmit(configPoint);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="Enter label" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TypeSelector form={form} />
        <CodeInput form={form} selectedCode={selectedCode} />

        <FormField
          control={form.control}
          name="template_placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Placeholder (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. {label}" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <RequiredToggle form={form} />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Add Configuration Point</Button>
      </form>
    </Form>
  );
}
