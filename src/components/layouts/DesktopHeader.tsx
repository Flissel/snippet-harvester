import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';

export const DesktopHeader = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur-sm border-b border-border px-6 lg:px-8 flex items-center justify-between">
      <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Snippet Harvester
      </h1>
      
      {user && <UserMenu isMobile={false} />}
    </header>
  );
};