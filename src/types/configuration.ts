
export interface ConfigurationPoint {
  id: string;
  snippet_id: string;
  label: string;
  start_position: number;
  end_position: number;
  config_type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default_value?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationPointInput {
  snippet_id: string;
  label: string;
  start_position: number;
  end_position: number;
  config_type: ConfigurationPoint['config_type'];
  default_value?: string;
  description?: string;
}
