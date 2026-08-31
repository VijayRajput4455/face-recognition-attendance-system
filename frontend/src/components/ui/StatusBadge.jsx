import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, XCircle, AlertCircle, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export function StatusBadge({ status, type = 'status', className, showIcon = true }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = null;
  let label = normalized;

  // Employment status
  if (type === 'employment' || ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(normalized)) {
    switch (normalized) {
      case 'ACTIVE':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
        label = 'Active';
        break;
      case 'INACTIVE':
        styles = 'bg-slate-100 text-slate-600 border-slate-200';
        icon = <XCircle className="w-3.5 h-3.5 text-slate-400" />;
        label = 'Inactive';
        break;
      case 'SUSPENDED':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
        label = 'Suspended';
        break;
      default:
        break;
    }
  }

  // Enrollment status
  if (type === 'enrollment' || ['COMPLETED', 'PROCESSING', 'FAILED', 'PENDING'].includes(normalized)) {
    switch (normalized) {
      case 'COMPLETED':
      case 'ENROLLED':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
        label = normalized === 'COMPLETED' ? 'Enrolled' : label;
        break;
      case 'PROCESSING':
        styles = 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
        icon = <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
        label = 'Processing...';
        break;
      case 'PENDING':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
        label = 'Pending';
        break;
      case 'FAILED':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
        label = 'Failed';
        break;
      default:
        break;
    }
  }

  // Attendance status
  if (type === 'attendance' || ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'].includes(normalized)) {
    switch (normalized) {
      case 'PRESENT':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        icon = <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
        break;
      case 'LATE':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
        break;
      case 'HALF_DAY':
        styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        icon = <Clock className="w-3.5 h-3.5 text-indigo-600" />;
        break;
      case 'ABSENT':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
        break;
      case 'ON_LEAVE':
        styles = 'bg-purple-50 text-purple-700 border-purple-200';
        icon = <AlertCircle className="w-3.5 h-3.5 text-purple-600" />;
        break;
      default:
        break;
    }
  }

  // Event type: ENTRY / EXIT
  if (type === 'event' || ['ENTRY', 'EXIT'].includes(normalized)) {
    switch (normalized) {
      case 'ENTRY':
        styles = 'bg-sky-50 text-sky-700 border-sky-200';
        icon = <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />;
        break;
      case 'EXIT':
        styles = 'bg-slate-100 text-slate-700 border-slate-200';
        icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
        break;
      default:
        break;
    }
  }

  // System Health
  if (type === 'health' || ['HEALTHY', 'UNHEALTHY', 'DEGRADED', 'CONNECTED'].includes(normalized)) {
    switch (normalized) {
      case 'HEALTHY':
      case 'CONNECTED':
      case 'OK':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
        label = 'Healthy';
        break;
      case 'DEGRADED':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
        label = 'Degraded';
        break;
      case 'UNHEALTHY':
      case 'ERROR':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
        label = 'Unhealthy';
        break;
      default:
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border shadow-2xs transition-colors',
        styles,
        className
      )}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
