import React, { useState } from 'react';
import { Building2, ChevronRight, UserCheck, Users, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DepartmentBiometricMatrix({
  departments = [],
  employees = [],
  enrollments = [],
  onNavigateDepartment,
}) {
  const [selectedDeptId, setSelectedDeptId] = useState(null);

  const deptData = departments.map((dept) => {
    const deptEmps = employees.filter((e) => e.department_id === dept.id);
    const total = deptEmps.length;
    const enrolled = deptEmps.filter((emp) =>
      enrollments.some((en) => en.employee_id === emp.id && en.status === 'COMPLETED')
    ).length;
    const rate = total > 0 ? Math.round((enrolled / total) * 100) : 0;

    return {
      id: dept.id,
      name: dept.department_name,
      total,
      enrolled,
      pending: Math.max(0, total - enrolled),
      rate,
      employees: deptEmps,
    };
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Department Face Recognition Matrix</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Face recognition coverage and enrolled staff count across departments
          </p>
        </div>


        <button
          type="button"
          onClick={() => onNavigateDepartment?.('departments')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Manage Departments</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {deptData.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No departments configured in the system yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {deptData.map((dept) => {
            const isSelected = selectedDeptId === dept.id;

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptId(isSelected ? null : dept.id)}
                className={cn(
                  'p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group',
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {dept.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {dept.total} Staff Assigned
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-full border shrink-0',
                      dept.rate >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : dept.rate >= 50
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}
                  >
                    {dept.rate}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        dept.rate >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : dept.rate >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-gradient-to-r from-indigo-500 to-blue-400'
                      )}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 pt-0.5">
                    <span className="text-emerald-700 font-semibold">{dept.enrolled} Enrolled</span>
                    <span className="text-slate-400">{dept.pending} Unenrolled</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DepartmentBiometricMatrix;
