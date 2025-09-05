import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Snippet Harvester
        </h1>
      </div>
      
      {user && <UserMenu isMobile={true} />}
    </header>
  );
};