
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Code2, 
  FileCode2, 
  Wand2,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Code2, label: 'Code Analysis', path: '/analyze' },
    { icon: FileCode2, label: 'Snippets', path: '/snippets' },
    { icon: Wand2, label: 'Generate', path: '/generate' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  return (
    <div
      className={cn(
        'h-screen fixed left-0 top-0 z-40 flex flex-col glass',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className={cn(
          'font-semibold transition-all duration-300',
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

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center p-3 rounded-lg',
                  'hover:bg-primary/10 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                )}
              >
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    'ml-3 transition-all duration-300',
                    collapsed ? 'opacity-0 w-0' : 'opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
