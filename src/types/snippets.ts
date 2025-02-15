
export interface Snippet {
  id: string;
  title: string;
  description?: string | null;
  code_content: string;
  language?: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
