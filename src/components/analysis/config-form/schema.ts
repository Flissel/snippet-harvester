
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
  },
  {
    label: 'Model Name',
    config_type: 'string',
    template_placeholder: '{model_name}',
    description: 'Name of the LLM model to use',
  },
  {
    label: 'API Key',
    config_type: 'string',
    template_placeholder: '{api_key}',
    description: 'API key for the LLM service',
  },
  {
    label: 'Code Interpreter',
    config_type: 'boolean',
    template_placeholder: '{code_interpreter}',
    description: 'Enable/disable code interpreter',
  },
  {
    label: 'Human Input Mode',
    config_type: 'string',
    template_placeholder: '{human_input_mode}',
    description: 'Mode for handling human input (e.g., NEVER, TERMINATE, ALWAYS)',
  },
  {
    label: 'Max Consecutive Auto-Reply',
    config_type: 'number',
    template_placeholder: '{max_consecutive_auto_reply}',
    description: 'Maximum number of consecutive auto-replies',
  },
  {
    label: 'Context Window',
    config_type: 'number',
    template_placeholder: '{context_window}',
    description: 'Size of the context window in tokens',
  },
  {
    label: 'System Prompt',
    config_type: 'string',
    template_placeholder: '{system_prompt}',
    description: 'System prompt for the agent',
  },
  {
    label: 'Functions Config',
    config_type: 'object',
    template_placeholder: '{functions_config}',
    description: 'Configuration for available functions',
  },
  {
    label: 'Custom Requirements',
    config_type: 'array',
    template_placeholder: '{custom_requirements}',
    description: 'List of custom requirements for the agent',
  },
  {
    label: 'Base URL',
    config_type: 'string',
    template_placeholder: '{base_url}',
    description: 'Base URL for API calls',
  },
  {
    label: 'Timeout',
    config_type: 'number',
    template_placeholder: '{timeout}',
    description: 'Timeout duration in seconds',
  }
];
