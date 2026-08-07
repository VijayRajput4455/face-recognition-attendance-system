import React from 'react';
import { Users, UserCheck, ShieldCheck, Scan, Calendar, Download, ChevronDown, Building2 } from 'lucide-react';

export function Dashboard({ setActiveTab }) {
  const topMetrics = [
    {
      title: 'Employees',
      value: '1,248',
      trend: '+ 12.5%',
      subText: 'from last week',
      trendColor: 'text-[#635BFF]',
      icon: Users,
      badgeStyle: 'bg-purple-100 text-[#635BFF]',
    },
    {
      title: 'Present Today',
      value: '856',
      trend: '+ 6.2%',
      subText: 'from last week',
      trendColor: 'text-emerald-600',
      icon: UserCheck,
      badgeStyle: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Recognitions',
      value: '2,653',
      trend: '+ 15.3%',
      subText: 'from last week',
      trendColor: 'text-blue-600',
      icon: ShieldCheck,
      badgeStyle: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Unknown Faces',
      value: '23',
      trend: '+ 5.6%',
      subText: 'from last week',
      trendColor: 'text-amber-600',
      icon: Scan,
      badgeStyle: 'bg-amber-100 text-amber-600',
    },
  ];

  const recentRecognitions = [
    { name: 'Amit Sharma', time: '10:24 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Neha Verma', time: '10:21 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { name: 'Unknown', time: '10:20 AM', status: 'Unknown', isUnknown: true, img: null },
    { name: 'Rohit Kumar', time: '10:18 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { name: 'Priya Singh', time: '10:15 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  ];

  const accessPoints = [
    { name: 'Main Entrance', count: 1245, max: 1500 },
    { name: 'Office Floor 1', count: 876, max: 1500 },
    { name: 'Parking Area', count: 623, max: 1500 },
    { name: 'Server Room', count: 322, max: 1500 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Dashboard
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Welcome back, Emma! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>May 18, 2024</span>
          </div>
          <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {topMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="visio-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {metric.title}
                </span>
                <div className={`p-2.5 rounded-xl ${metric.badgeStyle}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                  {metric.value}
                </div>
                <div className="mt-1 flex items-center space-x-1 text-xs">
                  <span className={`font-bold ${metric.trendColor}`}>
                    ↑ {metric.trend}
                  </span>
                  <span className="text-slate-400">{metric.subText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview Line Chart */}
        <div className="lg:col-span-2 visio-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Attendance Overview</h3>
            <button className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <span>This Week</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          {/* SVG Smooth Curve Line Chart */}
          <div className="h-56 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#635BFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#635BFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="24" fill="#94a3b8" fontSize="10" fontWeight="600">1K</text>
              <text x="15" y="74" fill="#94a3b8" fontSize="10" fontWeight="600">750</text>
              <text x="15" y="124" fill="#94a3b8" fontSize="10" fontWeight="600">500</text>
              <text x="15" y="164" fill="#94a3b8" fontSize="10" fontWeight="600">0</text>

              {/* Area Gradient Fill */}
              <path
                d="M 40,110 Q 110,40 180,60 T 320,30 T 460,70 L 460,160 L 40,160 Z"
                fill="url(#purpleGrad)"
              />

              {/* Curve Line */}
              <path
                d="M 40,110 Q 110,40 180,60 T 320,30 T 460,70"
                fill="none"
                stroke="#635BFF"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="40" cy="110" r="4" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="110" cy="50" r="5" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="180" cy="60" r="4" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="250" cy="110" r="4" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="320" cy="30" r="5" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="390" cy="80" r="4" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="460" cy="70" r="4" fill="#635BFF" stroke="#ffffff" strokeWidth="2" />
            </svg>

            <div className="flex justify-between px-8 text-xs font-semibold text-slate-400 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Recognition Stats Donut Chart */}
        <div className="visio-card p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-sans">Recognition Stats</h3>

          {/* SVG Donut Chart */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
              {/* Recognized 91.6% - Emerald */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray="230 251"
                strokeDashoffset="0"
                fill="transparent"
                strokeLinecap="round"
              />
              {/* Unknown 5.9% - Amber */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeDasharray="15 251"
                strokeDashoffset="-232"
                fill="transparent"
                strokeLinecap="round"
              />
              {/* Low Quality 2.5% - Purple */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#635BFF"
                strokeWidth="12"
                strokeDasharray="6 251"
                strokeDashoffset="-247"
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">2,653</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 font-medium">Recognized</span>
              </div>
              <span className="font-bold text-slate-900">2,430 (91.6%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                <span className="text-slate-600 font-medium">Unknown</span>
              </div>
              <span className="font-bold text-slate-900">156 (5.9%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#635BFF]" />
                <span className="text-slate-600 font-medium">Low Quality</span>
              </div>
              <span className="font-bold text-slate-900">67 (2.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Recognitions & Top Access Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Recognitions Strip */}
        <div className="visio-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Recent Recognitions</h3>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-[#635BFF] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-2">
            {recentRecognitions.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  {item.isUnknown ? (
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                      <Scan className="h-6 w-6" />
                    </div>
                  ) : (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 truncate max-w-[70px]">
                    {item.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">{item.time}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  item.isUnknown
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Access Points */}
        <div className="visio-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Top Access Points</h3>
            <button
              onClick={() => setActiveTab('access')}
              className="text-xs font-bold text-[#635BFF] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {accessPoints.map((ap, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-3.5 w-3.5 text-[#635BFF]" />
                    <span className="font-semibold text-slate-800">{ap.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{ap.count.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#635BFF] rounded-full"
                    style={{ width: `${(ap.count / ap.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
