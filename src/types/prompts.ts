
import { PromptType } from './analysis';

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  system_message: string;
  user_message: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  yaml_template?: string;
  model: string;
  prompt_type?: PromptType;
  prompt_generation_role?: string;
  prompt_generation_guidelines?: string;
  prompt_generation_structure?: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  config_type: string;
  template_placeholder?: string;
  default_value?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PromptLabelMapping {
  id: string;
  prompt_id: string;
  label_template_id: string;
  created_at: string;
}
