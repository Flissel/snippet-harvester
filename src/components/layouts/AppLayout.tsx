import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <ResponsiveSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            isMobile={true}
          />
          <main className="pt-16 px-4 pb-6">
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </>
      ) : (
        /* Desktop Layout */
        <div className="flex">
          <ResponsiveSidebar 
            isOpen={true} 
            onClose={() => {}}
            isMobile={false}
          />
          <div className="flex-1 lg:ml-64">
            <DesktopHeader />
            <main className="p-4 lg:p-6 xl:p-8">
              <div className="max-w-full mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};