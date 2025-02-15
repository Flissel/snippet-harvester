
import * as z from 'zod';

export const configPointSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  config_type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  default_value: z.string().optional(),
  description: z.string().optional(),
  template_placeholder: z.string().optional(),
  is_required: z.boolean().default(true),
});

export type ConfigPointFormValues = z.infer<typeof configPointSchema>;
