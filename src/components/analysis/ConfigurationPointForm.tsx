
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
import { configPointSchema, ConfigPointFormValues } from './config-form/schema';
import { useEffect } from 'react';

interface ConfigurationPointFormProps {
  snippet: Snippet;
  onSubmit: (data: ConfigurationPointInput) => void;
  selectedCode?: {
    text: string;
    start: number;
    end: number;
  } | null;
  initialValues?: any;
}

export function ConfigurationPointForm({ 
  snippet, 
  onSubmit,
  selectedCode,
  initialValues 
}: ConfigurationPointFormProps) {
  const form = useForm<ConfigPointFormValues>({
    resolver: zodResolver(configPointSchema),
    defaultValues: {
      label: '',
      config_type: 'string',
      default_value: selectedCode?.text ?? '',
      description: '',
      template_placeholder: '',
      start_position: selectedCode?.start ?? 0,
      end_position: selectedCode?.end ?? 0,
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        label: initialValues.label,
        config_type: initialValues.config_type,
        default_value: selectedCode?.text ?? '',
        description: initialValues.description || '',
        template_placeholder: initialValues.template_placeholder || `{${initialValues.label}}`,
        start_position: selectedCode?.start ?? 0,
        end_position: selectedCode?.end ?? 0,
      });
    }
  }, [initialValues, selectedCode, form]);

  const handleSubmit = (data: ConfigPointFormValues) => {
    const configPoint: ConfigurationPointInput = {
      snippet_id: snippet.id,
      label: data.label,
      config_type: data.config_type,
      default_value: data.default_value,
      description: data.description,
      template_placeholder: data.template_placeholder || `{${data.label}}`,
      start_position: selectedCode?.start ?? 0,
      end_position: selectedCode?.end ?? 0,
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
        <CodeInput form={form} selectedCode={selectedCode?.text} />

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
