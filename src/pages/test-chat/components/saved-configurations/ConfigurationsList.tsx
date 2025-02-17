
import { Prompt } from '@/types/prompts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfigurationCard } from './ConfigurationCard';

interface ConfigurationsListProps {
  configurations: Prompt[] | null;
  isLoading: boolean;
  onEdit: (config: Prompt) => void;
  onDelete: (config: Prompt) => void;
  onSelect: (config: Prompt) => void;
  onClose: () => void;
}

export function ConfigurationsList({
  configurations,
  isLoading,
  onEdit,
  onDelete,
  onSelect,
  onClose,
}: ConfigurationsListProps) {
  return (
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
            <ConfigurationCard
              key={config.id}
              config={config}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
