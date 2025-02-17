
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';

const DEFAULT_ROLE = `You are an expert in creating highly effective system prompts for AI agents. Your goal is to craft precise, contextual, and well-structured system prompts that will guide AI assistants in providing accurate and relevant responses.`;

const DEFAULT_GUIDELINES = `1. Be specific about the agent's role and expertise domain
2. Include clear constraints and boundaries
3. Define the expected interaction style and tone
4. Specify the format and structure of responses when relevant
5. Include relevant domain-specific terminology and concepts
6. Set clear ethical guidelines and bias prevention measures
7. Define success criteria for responses
8. Include error handling and edge case considerations`;

const DEFAULT_STRUCTURE = `1. Role and Expertise Definition
2. Primary Objectives
3. Interaction Guidelines
4. Response Requirements
5. Constraints and Limitations
6. Success Criteria`;

export function GenerationSettingsFields() {
  const form = useFormContext();
  const [useCustomSettings, setUseCustomSettings] = React.useState(false);

  const resetToDefaults = () => {
    form.setValue('prompt_generation_role', DEFAULT_ROLE);
    form.setValue('prompt_generation_guidelines', DEFAULT_GUIDELINES);
    form.setValue('prompt_generation_structure', DEFAULT_STRUCTURE);
  };

  const handleCustomSettingsChange = (checked: boolean) => {
    setUseCustomSettings(checked);
    if (!checked) {
      resetToDefaults();
    }
  };

  React.useEffect(() => {
    if (!useCustomSettings) {
      resetToDefaults();
    }
  }, [useCustomSettings]);

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

          <FormField
            control={form.control}
            name="prompt_generation_guidelines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generation Guidelines</FormLabel>
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
                <FormLabel>Response Structure</FormLabel>
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
        </>
      )}
    </div>
  );
}
