
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PromptsList } from '@/components/prompts/PromptsList';
import { PromptForm } from '@/components/prompts/PromptForm';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Prompt, LabelTemplate } from '@/types/prompts';
import { Plus, ArrowLeft } from 'lucide-react';

export default function PromptsManagement() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const { data: prompts, isLoading: isLoadingPrompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
  });

  const { data: labelTemplates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['label_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('label_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LabelTemplate[];
    },
  });

  if (isLoadingPrompts || isLoadingTemplates) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Prompts Management</h1>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        )}
      </div>

      <Card className="p-6">
        <Tabs defaultValue="prompts">
          <TabsList>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="templates">Label Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompts" className="space-y-4">
            {isCreating ? (
              <PromptForm onCancel={() => setIsCreating(false)} />
            ) : (
              <PromptsList prompts={prompts || []} />
            )}
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            {/* TODO: Implement label templates management */}
            <div>Label templates management coming soon...</div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
