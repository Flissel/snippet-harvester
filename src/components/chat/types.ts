
import { Prompt } from '@/types/prompts';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  created_at: string;
  created_by: string;
}

export interface ChatWindowProps {
  prompt?: Prompt;
  onResetChat?: () => void;
}
