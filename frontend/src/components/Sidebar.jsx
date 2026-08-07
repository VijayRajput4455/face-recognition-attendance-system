import React from 'react';
import {
  LayoutDashboard,
  Camera,
  CalendarCheck,
  Users,
  ShieldCheck,
  UserCheck,
  BarChart3,
  Bell,
  Cpu,
  Settings,
  CheckCircle2,
  ChevronDown,
  ScanFace
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'recognition', label: 'Live Recognition', icon: Camera },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'access', label: 'Access Control', icon: ShieldCheck },
    { id: 'visitors', label: 'Visitors', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30">
      <div>
        {/* VisioFace Logo */}
        <div className="p-6 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white shadow-md shadow-[#635BFF]/30">
            <ScanFace className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans leading-tight">
              VisioFace
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              Face Recognition System
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-[#635BFF]' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Profile */}
      <div className="p-4 space-y-3 border-t border-slate-100 bg-slate-50/50">
        {/* System Status Pill */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              System Status
            </p>
            <p className="text-xs font-semibold text-slate-800">
              All systems operational
            </p>
          </div>
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
              alt="Emma Johnson"
              className="h-9 w-9 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Emma Johnson
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Super Admin
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
