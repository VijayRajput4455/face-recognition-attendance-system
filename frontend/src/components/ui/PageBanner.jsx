import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PageBanner({
  badge = 'AI-Powered Workforce Platform',
  badgeIcon: BadgeIcon = Sparkles,
  title,
  description,
  actions,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden',
        className
      )}
    >
      {/* Subtle glowing ambient lights */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Text & Badge */}
      <div className="relative z-10 space-y-1.5 max-w-2xl">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-1.5 border border-white/10">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-indigo-300" />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed font-normal">{description}</p>
        )}
      </div>

      {/* Right Action Buttons */}
      {actions && (
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageBanner;
