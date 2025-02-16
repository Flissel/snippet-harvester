
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LabelTemplate } from '@/types/prompts';

const labelTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  config_type: z.string().min(1, 'Configuration type is required'),
  template_placeholder: z.string().optional(),
  default_value: z.string().optional(),
});

type LabelTemplateFormValues = z.infer<typeof labelTemplateSchema>;

interface LabelTemplateFormProps {
  template?: LabelTemplate;
  onCancel: () => void;
}

export function LabelTemplateForm({ template, onCancel }: LabelTemplateFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<LabelTemplateFormValues>({
    resolver: zodResolver(labelTemplateSchema),
    defaultValues: template || {
      name: '',
      description: '',
      config_type: '',
      template_placeholder: '',
      default_value: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: LabelTemplateFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (template) {
        const { error } = await supabase
          .from('label_templates')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('label_templates')
          .insert({
            ...values,
            created_by: user.id,
            name: values.name,
            config_type: values.config_type,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label_templates'] });
      toast.success(template ? 'Label template updated successfully' : 'Label template created successfully');
      onCancel();
    },
    onError: (error) => {
      toast.error(`Failed to ${template ? 'update' : 'create'} label template: ` + error.message);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter label template name" {...field} />
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
                <Textarea
                  placeholder="Enter label template description (optional)"
                  className="resize-none"
                  {...field}
                />
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
              <FormLabel>Configuration Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
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
          name="template_placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Placeholder</FormLabel>
              <FormControl>
                <Input placeholder="e.g. {variable_name}" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Value</FormLabel>
              <FormControl>
                <Input placeholder="Enter default value (optional)" {...field} />
              </FormControl>
              <FormMessage />
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
            {template ? 'Update' : 'Create'} Label Template
          </Button>
        </div>
      </form>
    </Form>
  );
}
