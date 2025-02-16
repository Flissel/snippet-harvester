
import { Prompt } from '@/types/prompts';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  context?: string;
}

export interface ChatWindowProps {
  prompt?: Prompt;
}
