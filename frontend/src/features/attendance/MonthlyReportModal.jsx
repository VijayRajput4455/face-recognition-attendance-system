import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { employeesApi } from '../../api/employees';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { formatMinutes } from '../../lib/utils';
import { FileText, CalendarCheck2, Clock, Loader2, Calendar } from 'lucide-react';

export function MonthlyReportModal({ isOpen, onClose, defaultEmployeeId }) {
  const now = new Date();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(defaultEmployeeId || '');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Fetch employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
    enabled: isOpen,
  });

  // If no default, pick first employee
  React.useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(defaultEmployeeId || employees[0].id);
    }
  }, [employees, defaultEmployeeId, selectedEmployeeId]);

  // Fetch Report
  const { data: report, isLoading } = useQuery({
    queryKey: ['monthly-report', selectedEmployeeId, month, year],
    queryFn: () => attendanceApi.getMonthlyReport(selectedEmployeeId, month, year),
    enabled: isOpen && Boolean(selectedEmployeeId),
  });

  const selectedEmpObj = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Monthly Attendance Summary Report" size="lg">
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name || ''} ({emp.employee_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Summary Cards */}
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : report ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedEmpObj?.first_name} {selectedEmpObj?.last_name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">{selectedEmpObj?.employee_code}</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })} {year}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                title="Present Days"
                value={`${report.present_days} Days`}
                subtitle="Days with recorded check-in"
                icon={CalendarCheck2}
                color="emerald"
              />
              <StatCard
                title="Total Working Hours"
                value={report.total_working_duration || formatMinutes(report.total_working_minutes)}
                subtitle="Calculated shift duration"
                icon={Clock}
                color="indigo"
              />
              <StatCard
                title="Working Minutes"
                value={`${report.total_working_minutes} Mins`}
                subtitle="Exact minute sum"
                icon={FileText}
                color="blue"
              />
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No attendance summaries calculated for this period.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default MonthlyReportModal;
