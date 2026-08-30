import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '../../lib/utils';

export function AppLayout({ children }) {
  const { sidebarCollapsed } = useNavigation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-w-0',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
