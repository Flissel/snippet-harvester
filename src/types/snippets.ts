
export interface Snippet {
  id: string;
  title: string;
  description?: string | null;
  code_content: string;
  language?: string | null;
  created_by: string;
  team_id?: string | null;
  is_public: boolean;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    is_admin: boolean;
  } | null;
  teams?: {
    name: string;
  } | null;
  snippet_label_associations?: Array<{
    snippet_labels: {
      name: string;
      color: string;
    };
  }>;
}
