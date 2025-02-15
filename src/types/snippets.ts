
export interface Snippet {
  id: string;
  title: string;
  description?: string | null;
  code_content: string;
  language?: string | null;
  created_by: string;
  team_id?: string | null;
  organization_id?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  complexity_level?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
  teams?: {
    name: string;
  } | null;
}
