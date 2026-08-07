import React, { useState } from 'react';
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, Key, ChevronRight } from 'lucide-react';

export function AccessControl() {
  const [activeTab, setActiveTab] = useState('Doors');

  const stats = [
    { label: 'Total Doors', value: '12', color: 'text-slate-900 dark:text-white' },
    { label: 'Online', value: '10', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Offline', value: '2', color: 'text-rose-600 dark:text-rose-400' },
    { label: 'Access Denied', value: '15', sub: 'Today', color: 'text-slate-900 dark:text-white' },
  ];

  const doors = [
    { name: 'Main Entrance', status: 'Online', access: '1,245 today', isOnline: true },
    { name: 'Office Floor 1', status: 'Online', access: '875 today', isOnline: true },
    { name: 'Server Room', status: 'Online', access: '322 today', isOnline: true },
    { name: 'Parking Area', status: 'Online', access: '623 today', isOnline: true },
    { name: 'Office Floor 2', status: 'Offline', access: 'Last seen 2h ago', isOnline: false },
    { name: 'HR Cabin', status: 'Online', access: '245 today', isOnline: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            Access Control
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage doors, zones and access permissions
          </p>
        </div>

        <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5247e6] text-white font-semibold text-xs shadow-md shadow-[#635BFF]/25">
          <Plus className="h-4 w-4" />
          <span>Add Door</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => (
          <div key={idx} className="visio-card p-4">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{st.label}</p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-sans ${st.color}`}>{st.value}</span>
              {st.sub && <span className="text-xs font-semibold text-slate-400">{st.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Door Grid Section */}
      <div className="visio-card p-6 space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 space-x-8 text-xs font-bold">
          {['Doors', 'Access Logs', 'Time Schedules', 'Permissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors ${
                activeTab === tab
                  ? 'text-[#635BFF] border-b-2 border-[#635BFF]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Doors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doors.map((door, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${
                  door.isOnline ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{door.name}</h4>
                  <p className={`text-[10px] font-semibold ${
                    door.isOnline ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {door.status}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Authorized Access {door.access}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Access Logs */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span>Recent Access Logs</span>
            <button className="text-[#635BFF] hover:underline">View All</button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Amit Sharma"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Amit Sharma (EMP001)</span>
                <p className="text-[10px] text-slate-400">Main Entrance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                Granted
              </span>
              <span className="font-mono text-slate-400 text-[11px]">10:24:35 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessControl;
