
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ConfigurationPointInput } from '@/types/configuration';
import { Snippet } from '@/types/snippets';

const configPointSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  config_type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  default_value: z.string().optional(),
  description: z.string().optional(),
  template_placeholder: z.string().optional(),
  is_required: z.boolean().default(true),
});

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
  const form = useForm<ConfigurationPointInput>({
    resolver: zodResolver(configPointSchema),
    defaultValues: {
      snippet_id: snippet.id,
      label: '',
      config_type: 'string',
      default_value: selectedCode ?? '',
      description: '',
      template_placeholder: '',
      is_required: true,
    },
  });

  const handleSubmit = (data: ConfigurationPointInput) => {
    if (!data.template_placeholder) {
      data.template_placeholder = `{${data.label}}`;
    }
    onSubmit(data);
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

        <FormField
          control={form.control}
          name="config_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selected Code</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Selected code will appear here" 
                  {...field} 
                  value={selectedCode || field.value}
                  className="font-mono"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="is_required"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel>Required</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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
