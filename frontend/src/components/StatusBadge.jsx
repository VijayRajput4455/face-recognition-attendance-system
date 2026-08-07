import React from 'react';

export function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (['ACTIVE', 'ENROLLED', 'PRESENT', 'HEALTHY', 'COMPLETED', 'SUCCESS'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  } else if (['PENDING', 'PROCESSING', 'LATE', 'WARNING'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  } else if (['INACTIVE', 'FAILED', 'ABSENT', 'UNHEALTHY', 'NOT_ENROLLED'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
      {status || 'UNKNOWN'}
    </span>
  );
}

export default StatusBadge;
