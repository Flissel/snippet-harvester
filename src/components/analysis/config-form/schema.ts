
import * as z from 'zod';

export const configPointSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  config_type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  default_value: z.string().optional(),
  description: z.string().optional(),
  template_placeholder: z.string().min(1, 'Template placeholder is required'),
  is_required: z.boolean().default(true),
  start_position: z.number(),
  end_position: z.number(),
});

export type ConfigPointFormValues = z.infer<typeof configPointSchema>;

// Predefined configuration points that can be dragged
export const predefinedConfigPoints = [
  {
    label: 'Agent Name',
    config_type: 'string',
    template_placeholder: '{agent_name}',
    description: 'Name of the AutoGen agent',
  },
  {
    label: 'System Message',
    config_type: 'string',
    template_placeholder: '{system_message}',
    description: 'System message for the agent',
  },
  {
    label: 'Temperature',
    config_type: 'number',
    template_placeholder: '{temperature}',
    description: 'Temperature parameter for the agent',
  },
  {
    label: 'Max Tokens',
    config_type: 'number',
    template_placeholder: '{max_tokens}',
    description: 'Maximum tokens for the agent',
  },
  {
    label: 'Tools List',
    config_type: 'array',
    template_placeholder: '{tools}',
    description: 'List of tools available to the agent',
  }
];
