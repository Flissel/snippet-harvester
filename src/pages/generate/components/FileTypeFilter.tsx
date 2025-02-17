
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FileTypeFilterProps {
  availableTypes: string[];
  selectedTypes: string[];
  onTypeChange: (type: string) => void;
}

export function FileTypeFilter({ availableTypes, selectedTypes, onTypeChange }: FileTypeFilterProps) {
  const handleTypeClick = (type: string) => {
    if (type === 'all') {
      onTypeChange('all');
      return;
    }

    if (selectedTypes.includes(type)) {
      const newTypes = selectedTypes.filter(t => t !== type);
      onTypeChange(newTypes.length ? newTypes.join(',') : 'all');
    } else {
      const newTypes = [...selectedTypes, type];
      onTypeChange(newTypes.join(','));
    }
  };

  return (
    <ScrollArea className="max-w-[300px] max-h-[40px]">
      <div className="flex items-center gap-2 px-1">
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer hover:bg-primary/10",
            selectedTypes.length === 0 && "bg-primary/10"
          )}
          onClick={() => handleTypeClick('all')}
        >
          All
        </Badge>
        {availableTypes.map((type) => (
          <Badge
            key={type}
            variant="outline"
            className={cn(
              "cursor-pointer hover:bg-primary/10",
              selectedTypes.includes(type) && "bg-primary/10"
            )}
            onClick={() => handleTypeClick(type)}
          >
            .{type}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
}
