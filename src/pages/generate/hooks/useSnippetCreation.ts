
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileNode, DirectoryNode, collectFilesFromDirectory } from '../types';

export function useSnippetCreation(userId: string | undefined) {
  const navigate = useNavigate();
  const [isCreatingSnippets, setIsCreatingSnippets] = useState(false);

  const createSingleSnippet = async (file: FileNode, fileContent: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('snippets')
        .insert({
          title: file.name,
          code_content: fileContent,
          language: file.extension || 'text',
          created_by: userId,
          source_url: file.url,
          source_path: file.path
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Snippet created successfully');
      navigate(`/analyze/${data.id}`);
    } catch (error: any) {
      toast.error('Failed to create snippet: ' + error.message);
    }
  };

  const createDirectorySnippets = async (directory: DirectoryNode) => {
    if (!userId) return;

    const files = collectFilesFromDirectory(directory, ['py']);
    if (files.length === 0) {
      toast.error('No Python files found in this directory');
      return;
    }

    setIsCreatingSnippets(true);
    const createdSnippets: string[] = [];

    try {
      for (const file of files) {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
        const content = await response.text();

        const { data, error } = await supabase
          .from('snippets')
          .insert({
            title: `${directory.name}/${file.name}`,
            code_content: content,
            language: file.extension || 'text',
            created_by: userId,
            source_url: file.url,
            source_path: file.path
          })
          .select()
          .single();

        if (error) throw error;
        createdSnippets.push(data.id);
      }

      toast.success(`Created ${createdSnippets.length} snippets successfully`);
      if (createdSnippets.length > 0) {
        navigate(`/analyze/${createdSnippets[0]}`);
      }
    } catch (error: any) {
      toast.error('Failed to create snippets: ' + error.message);
    } finally {
      setIsCreatingSnippets(false);
    }
  };

  return {
    isCreatingSnippets,
    createSingleSnippet,
    createDirectorySnippets
  };
}
