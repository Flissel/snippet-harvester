
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileTypeFilterProps {
  availableTypes: string[];
  selectedTypes: string[];
  onTypeChange: (value: string) => void;
}

export function FileTypeFilter({
  availableTypes,
  selectedTypes,
  onTypeChange
}: FileTypeFilterProps) {
  return (
    <Select 
      value={selectedTypes.length === 0 ? "all" : selectedTypes.join(',')}
      onValueChange={onTypeChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[200px]">
          <SelectItem value="all">All files</SelectItem>
          {availableTypes.map((type) => (
            <SelectItem key={type} value={type}>
              .{type}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
