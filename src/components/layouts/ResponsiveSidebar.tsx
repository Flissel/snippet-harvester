import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Code2, 
  FileCode2, 
  Wand2,
  UserCircle,
  Beaker,
  MessagesSquare,
  X,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    ]
  },
  {
    label: 'Development',
    items: [
      { icon: Code2, label: 'Code Analysis', path: '/analyze' },
      { icon: FileCode2, label: 'Snippets', path: '/snippets' },
      { icon: Wand2, label: 'Generate', path: '/generate' },
    ]
  },
  {
    label: 'Agent Eval',
    items: [
      { icon: Beaker, label: 'Prompt Management', path: '/prompts' },
      { icon: MessagesSquare, label: 'Test Chat', path: '/test-chat' },
    ]
  },
  {
    label: 'Account',
    items: [
      { icon: UserCircle, label: 'Profile', path: '/profile' },
    ]
  }
];

interface ResponsiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const ResponsiveSidebar = ({ isOpen, onClose, isMobile }: ResponsiveSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
        <h1 className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          AutoGen
        </h1>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="space-y-6">
          {menuGroups.map((group, index) => (
            <div key={group.label} className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground px-2">
                {group.label}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        'w-full flex items-center p-3 lg:p-2 rounded-lg gap-3',
                        'hover:bg-primary/10 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary',
                        'text-left min-h-[44px] lg:min-h-[36px]', // Touch-friendly on mobile
                        isActive && 'bg-primary/15 text-primary font-medium'
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive && 'text-primary'
                      )} />
                      <span className="flex-1 text-sm">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              {index < menuGroups.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-80 sm:w-96">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 border-r border-border">
      <SidebarContent />
    </div>
  );
};