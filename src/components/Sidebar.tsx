
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Code2, 
  FileCode2, 
  Wand2,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Keyboard,
  Beaker,
  MessagesSquare,
  LucideIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Define interface for menu items
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

// Groups of menu items for better organization
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

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Keyboard shortcut for collapse/expand
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '\\') {
        setCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'h-screen fixed left-0 top-0 z-40 flex flex-col glass',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className={cn(
            'font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-300',
            collapsed ? 'opacity-0 w-0' : 'opacity-100'
          )}>
            AutoGen
          </h1>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {menuGroups.map((group, index) => (
              <div key={group.label} className="space-y-2">
                <div className={cn(
                  'text-xs font-medium text-muted-foreground px-2',
                  collapsed && 'opacity-0'
                )}>
                  {group.label}
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    
                    const menuItem = (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          'w-full flex items-center p-2 rounded-lg gap-3',
                          'hover:bg-primary/10 transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-primary',
                          isActive && 'bg-primary/15 text-primary font-medium'
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5",
                          isActive && 'text-primary'
                        )} />
                        <span
                          className={cn(
                            'flex-1 text-sm transition-all duration-300',
                            collapsed ? 'w-0 hidden' : 'block'
                          )}
                        >
                          {item.label}
                        </span>
                        {item.badge && !collapsed && (
                          <Badge variant="default" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );

                    return collapsed ? (
                      <Tooltip key={item.path}>
                        <TooltipTrigger asChild>
                          {menuItem}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <Badge variant="default">{item.badge}</Badge>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : menuItem;
                  })}
                </div>

                {index < menuGroups.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className={cn(
          'p-4 border-t border-border text-xs text-muted-foreground',
          'flex items-center gap-2',
          collapsed && 'justify-center'
        )}>
          {!collapsed && (
            <>
              <Keyboard className="h-3 w-3" />
              <span>Ctrl + \ to toggle</span>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
