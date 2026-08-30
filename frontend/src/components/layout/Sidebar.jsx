import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  CalendarCheck2,
  ScanFace,
  Video,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function Sidebar() {
  const { currentPage, navigate, sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } =
    useNavigation();

  const navSections = [
    {
      group: 'OVERVIEW',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      group: 'WORKFORCE',
      items: [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'departments', label: 'Departments', icon: Building2 },
        { id: 'designations', label: 'Designations', icon: Briefcase },
        { id: 'shifts', label: 'Shifts', icon: Clock },
      ],
    },
    {
      group: 'ATTENDANCE',
      items: [{ id: 'attendance', label: 'Attendance', icon: CalendarCheck2 }],
    },
    {
      group: 'AI & BIOMETRICS',
      items: [
        { id: 'recognition', label: 'Face Recognition', icon: ScanFace },
        { id: 'enrollments', label: 'Enrollments', icon: Video },
      ],
    },
    {
      group: 'SYSTEM',
      items: [{ id: 'system-health', label: 'System Health', icon: Activity }],
    },
  ];

  const handleNav = (id) => {
    navigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 shadow-xs',
          sidebarCollapsed ? 'w-20' : 'w-64',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-slate-50/50">
          <div
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shrink-0">
              <ScanFace className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                  FaceAttend <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 truncate">
                  Enterprise Attendance
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 select-none">
                  {section.group}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPage === item.id ||
                  (item.id === 'employees' && currentPage === 'employee-profile') ||
                  (item.id === 'enrollments' && currentPage === 'enrollment-wizard');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative cursor-pointer',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-indigo-600 stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {isActive && (
                      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-600 hidden sm:block" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* AI Engine Status Widget */}
        {!sidebarCollapsed && (
          <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Vision Engine
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-sm">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">InsightFace + Milvus vector storage connected</p>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
