import React from 'react';
import { ShieldCheck, Zap, ScanFace } from 'lucide-react';

export function BiometricAccuracyGauge({
  avgConfidence = 96.8,
  highCount = 0,
  mediumCount = 0,
  lowCount = 0,
  totalScans = 0,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Biometric Match Accuracy
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          {avgConfidence}% Avg Cosine
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {/* Tier 1: >95% Ultra High Precision */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Ultra High Match (&gt;95%)</span>
            <span className="font-mono font-bold text-emerald-600">{highCount}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalScans > 0 ? (highCount / totalScans) * 100 : 85}%` }}
            />
          </div>
        </div>

        {/* Tier 2: 80% - 95% Strong Match */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Strong Match (80% - 95%)</span>
            <span className="font-mono font-bold text-indigo-600">{mediumCount}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalScans > 0 ? (mediumCount / totalScans) * 100 : 12}%` }}
            />
          </div>
        </div>

        {/* Tier 3: <80% Standard / Flagged */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Standard / Low (&lt;80%)</span>
            <span className="font-mono font-bold text-amber-600">{lowCount}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalScans > 0 ? (lowCount / totalScans) * 100 : 3}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiometricAccuracyGauge;
