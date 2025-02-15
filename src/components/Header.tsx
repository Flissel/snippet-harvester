
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full glass-hover sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold">AutoGen Snippets</h2>
      </div>
      <div className="flex items-center space-x-4">
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </div>
    </header>
  );
};
