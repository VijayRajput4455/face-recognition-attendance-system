import React from 'react';
import { Sun, Moon, Bell, Calendar } from 'lucide-react';

export function Navbar({ darkMode, setDarkMode }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 w-full">
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <span className="font-semibold text-slate-900">VisioFace Portal</span>
        <span>/</span>
        <span>Enterprise Security & Attendance</span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Date Selector Badge */}
        <div className="hidden sm:flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>May 18, 2024</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Notifications Icon with Badge */}
        <button className="relative h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
