
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/prompts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface SavedConfigurationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigurationSelect: (config: Prompt) => void;
}

export function SavedConfigurationsDialog({
  open,
  onOpenChange,
  onConfigurationSelect,
}: SavedConfigurationsDialogProps) {
  const { data: configurations, isLoading } = useQuery({
    queryKey: ['saved-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Saved Configurations</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : configurations?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No saved configurations found
            </p>
          ) : (
            <div className="space-y-4">
              {configurations?.map((config) => (
                <Card key={config.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{config.name}</h3>
                      {config.description && (
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(config.created_at))} ago
                      </p>
                    </div>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        onConfigurationSelect(config as Prompt);
                        onOpenChange(false);
                      }}
                    >
                      Load
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
