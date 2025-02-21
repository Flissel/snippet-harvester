
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptTemplate } from '@/types/prompts';
import { toast } from 'sonner';
import { Plus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const DEFAULT_ROLE = `You are an expert in creating highly effective system prompts for AI agents. Your goal is to craft precise, contextual, and well-structured system prompts that will guide AI assistants in providing accurate and relevant responses.`;

export function GenerationSettingsFields() {
  const form = useFormContext();
  const queryClient = useQueryClient();
  const [useCustomSettings, setUseCustomSettings] = React.useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = React.useState(false);
  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [selectedTemplateType, setSelectedTemplateType] = React.useState<'guidelines' | 'structure'>('guidelines');

  const { data: templates } = useQuery({
    queryKey: ['prompt_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromptTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('prompt_templates')
        .insert([{ ...template, created_by: user.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt_templates'] });
      toast.success('Template saved successfully');
      setIsCreatingTemplate(false);
      setNewTemplateName('');
    },
    onError: (error) => {
      toast.error('Failed to save template: ' + error.message);
    },
  });

  const handleCustomSettingsChange = (checked: boolean) => {
    setUseCustomSettings(checked);
  };

  const handleTemplateSelect = (type: 'guidelines' | 'structure', templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      if (type === 'guidelines') {
        form.setValue('prompt_generation_guidelines', template.content);
      } else {
        form.setValue('prompt_generation_structure', template.content);
      }
    }
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName) {
      toast.error('Please enter a template name');
      return;
    }

    const content = selectedTemplateType === 'guidelines' 
      ? form.getValues('prompt_generation_guidelines')
      : form.getValues('prompt_generation_structure');

    if (!content) {
      toast.error(`Please enter ${selectedTemplateType} content`);
      return;
    }

    createTemplateMutation.mutate({
      name: newTemplateName,
      type: selectedTemplateType,
      content,
      is_default: false,
    });
  };

  const guidelinesTemplates = templates?.filter(t => t.type === 'guidelines') || [];
  const structureTemplates = templates?.filter(t => t.type === 'structure') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormLabel>Custom Generation Settings</FormLabel>
        <Switch 
          checked={useCustomSettings}
          onCheckedChange={handleCustomSettingsChange}
        />
      </div>

      {useCustomSettings && (
        <>
          <FormField
            control={form.control}
            name="prompt_generation_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generation Role</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Define the role and expertise of the prompt generation AI..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Define how the AI should approach prompt generation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="prompt_generation_guidelines"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Generation Guidelines</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(value) => handleTemplateSelect('guidelines', value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {guidelinesTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={isCreatingTemplate && selectedTemplateType === 'guidelines'} 
                             onOpenChange={(open) => {
                               setIsCreatingTemplate(open);
                               setSelectedTemplateType('guidelines');
                             }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Save as Template</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Template name"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                            />
                            <Button onClick={handleSaveTemplate}>Save Template</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="List the guidelines for generating prompts..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify the guidelines the AI should follow when creating prompts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_generation_structure"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Response Structure</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(value) => handleTemplateSelect('structure', value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {structureTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog 
                        open={isCreatingTemplate && selectedTemplateType === 'structure'}
                        onOpenChange={(open) => {
                          setIsCreatingTemplate(open);
                          setSelectedTemplateType('structure');
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Save as Template</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Template name"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                            />
                            <Button onClick={handleSaveTemplate}>Save Template</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Define the structure of generated prompts..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define how the generated prompts should be structured.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
