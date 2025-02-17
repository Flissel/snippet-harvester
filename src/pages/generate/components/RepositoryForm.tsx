
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface RepositoryFormProps {
  repositoryUrl: string;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RepositoryForm({ 
  repositoryUrl, 
  isLoading, 
  onUrlChange, 
  onSubmit 
}: RepositoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter GitHub repository URL"
          value={repositoryUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Scan Repository
        </Button>
      </div>
    </form>
  );
}
