import React, { useState } from 'react';
import { Building2, ArrowUpDown, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DepartmentEnrollmentHealthTable({
  departments = [],
  onSelectDepartment,
}) {
  const [sortField, setSortField] = useState('total'); // 'total' | 'rate' | 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const data = departments.map((dept) => ({
    id: dept.id,
    name: dept.department_name,
    total: dept.total ?? 0,
    enrolled: dept.enrolled ?? 0,
    pending: dept.pending ?? 0,
    completion: dept.completion_percentage ?? 0.0,
    health: dept.health || (dept.completion_percentage >= 85 ? 'high' : dept.completion_percentage >= 70 ? 'moderate' : 'low'),
  }));

  // Sorting
  const sortedData = [...data].sort((a, b) => {
    let result = 0;
    if (sortField === 'name') result = a.name.localeCompare(b.name);
    else if (sortField === 'rate') result = a.completion - b.completion;
    else result = a.total - b.total;
    return sortOrder === 'desc' ? -result : result;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Department Enrollment Health</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative enrollment compliance across all organizational units
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            High (&ge;85%)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Moderate (70-84%)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            Low (&lt;70%)
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      {departments.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
          <Building2 className="w-8 h-8 mx-auto text-slate-300" />
          <p>No departments configured in the database yet.</p>
          <button
            type="button"
            onClick={() => onSelectDepartment?.()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-xs hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Department</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => toggleSort('name')}
                  className="pb-3 pr-4 cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Department
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('total')}
                  className="pb-3 px-4 cursor-pointer hover:text-slate-700 transition-colors text-right"
                >
                  <span className="flex items-center justify-end gap-1">
                    Total Staff
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="pb-3 px-4 text-right">Face Enrolled</th>
                <th className="pb-3 px-4 text-right">Pending Action</th>
                <th
                  onClick={() => toggleSort('rate')}
                  className="pb-3 px-4 cursor-pointer hover:text-slate-700 transition-colors text-right"
                >
                  <span className="flex items-center justify-end gap-1">
                    Completion Rate
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="pb-3 pl-4 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectDepartment?.(row.id)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 pr-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                    {row.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                    {row.enrolled.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-600">
                    {row.pending.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            row.health === 'high'
                              ? 'bg-emerald-500'
                              : row.health === 'moderate'
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          )}
                          style={{ width: `${row.completion}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-900">{row.completion}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                        row.health === 'high'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : row.health === 'moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      )}
                    >
                      {row.health === 'high'
                        ? 'High'
                        : row.health === 'moderate'
                        ? 'Moderate'
                        : 'Attention Needed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DepartmentEnrollmentHealthTable;
