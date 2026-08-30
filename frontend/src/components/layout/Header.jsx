import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { systemApi } from '../../api/system';
import {
  Menu,
  Bell,
  Search,
  ScanFace,
  UserPlus,
  Video,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const { setMobileMenuOpen, getBreadcrumbs, navigate } = useNavigation();
  const [systemHealthy, setSystemHealthy] = useState(true);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await systemApi.getAggregateHealth();
        if (isMounted) {
          const isHealthy = res.api?.status === 'healthy' && res.milvus?.status !== 'unhealthy';
          setSystemHealthy(isHealthy);
        }
      } catch {
        if (isMounted) setSystemHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 truncate">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              {crumb.pageId ? (
                <button
                  onClick={() => navigate(crumb.pageId)}
                  className={cn(
                    'font-medium transition-colors truncate hover:text-indigo-600',
                    idx === breadcrumbs.length - 1 ? 'text-slate-900 font-semibold' : 'text-slate-500'
                  )}
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={cn(
                    'truncate',
                    crumb.isCategory ? 'text-[10px] font-bold text-slate-400 uppercase tracking-wider' : 'text-slate-700'
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Status Pill, Quick Actions, Profile */}
      <div className="flex items-center gap-3">
        {/* Backend & Milvus Status Pill */}
        <div
          onClick={() => navigate('system-health')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:bg-slate-50"
          title="Click to view System Health"
        >
          <span
            className={cn('w-2 h-2 rounded-full', systemHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')}
          />
          <span className={cn(systemHealthy ? 'text-emerald-700' : 'text-rose-700')}>
            {systemHealthy ? 'AI Systems Online' : 'System Degraded'}
          </span>
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    navigate('recognition');
                    setQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <ScanFace className="w-4 h-4 text-indigo-600" />
                  Recognize Face
                </button>
                <button
                  onClick={() => {
                    navigate('enrollments', { mode: 'wizard' });
                    setQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Video className="w-4 h-4 text-sky-600" />
                  Enroll Biometrics
                </button>
                <button
                  onClick={() => {
                    navigate('employees', { action: 'create' });
                    setQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Add Employee
                </button>
              </div>
            </>
          )}
        </div>

        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            AD
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">Admin Console</span>
            <span className="text-[10px] text-slate-400">Security & Workforce</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
