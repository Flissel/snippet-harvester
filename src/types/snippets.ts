
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
  updated_at: string;
  version?: string;
  framework?: string[];
  complexity_level?: 'beginner' | 'intermediate' | 'advanced';
  documentation?: string | null;
  usage_examples?: string[];
  category?: string | null;
  tags?: string[];
  metadata?: Record<string, any>;
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

export interface SnippetVersion {
  id: string;
  snippet_id: string;
  version: string;
  code_content: string;
  created_at: string;
  created_by?: string;
  change_summary?: string | null;
}

export interface SnippetComment {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string | null;
  is_resolved: boolean;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export interface SnippetCategory {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  organization_id?: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface SnippetAccessControl {
  id: string;
  snippet_id: string;
  user_id?: string;
  team_id?: string;
  permission_level: 'read' | 'write' | 'admin';
  created_at: string;
}
