import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../context/NavigationContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import SearchInput from '../../components/ui/SearchInput';
import Drawer from '../../components/ui/Drawer';
import MonthlyReportModal from './MonthlyReportModal';
import PageBanner from '../../components/ui/PageBanner';
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatMinutes,
  formatConfidence,
  getInitials,
  getAvatarColor,
} from '../../lib/utils';
import {
  CalendarCheck2,
  ListFilter,
  FileText,
  UserCheck,
  UserX,
  Clock,
  ScanFace,
  Plus,
  Eye,
  Calendar,
  Building2,
  Trash2,
} from 'lucide-react';

export function AttendancePage() {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('summaries'); // 'summaries' | 'logs'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 1. Fetch Attendance Summaries
  const { data: summaries = [], isLoading: loadingSummaries } = useQuery({
    queryKey: ['attendance-summaries'],
    queryFn: attendanceApi.getSummaries,
  });

  // 2. Fetch Attendance Logs
  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['attendance-logs'],
    queryFn: attendanceApi.getLogs,
  });

  // 3. Fetch Employees for mapping
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // 4. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Lookup maps
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const departmentMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, d.department_name));
    return map;
  }, [departments]);

  // Filtered Summaries
  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const emp = employeeMap.get(s.employee_id);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.toLowerCase() : '';
        const code = (emp?.employee_code || '').toLowerCase();
        if (!empName.includes(q) && !code.includes(q)) return false;
      }
      if (selectedDate && s.attendance_date !== selectedDate) {
        return false;
      }
      if (selectedDepartment && emp?.department_id !== selectedDepartment) {
        return false;
      }
      if (selectedStatus && s.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [summaries, searchQuery, selectedDate, selectedDepartment, selectedStatus, employeeMap]);

  // Filtered Raw Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const emp = employeeMap.get(l.employee_id);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.toLowerCase() : '';
        const code = (emp?.employee_code || '').toLowerCase();
        if (!empName.includes(q) && !code.includes(q)) return false;
      }
      if (selectedDate && !l.recognition_time?.startsWith(selectedDate)) {
        return false;
      }
      if (selectedDepartment && emp?.department_id !== selectedDepartment) {
        return false;
      }
      return true;
    });
  }, [logs, searchQuery, selectedDate, selectedDepartment, employeeMap]);

  // Summaries Table Columns
  const summaryColumns = [
    {
      header: 'Employee',
      accessor: 'employee_id',
      sortable: true,
      render: (s) => {
        const emp = employeeMap.get(s.employee_id);
        const name = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unknown Employee';
        const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
        const avatarColor = getAvatarColor(name);

        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {emp?.employee_code || s.employee_id.substring(0, 8)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (s) => {
        const emp = employeeMap.get(s.employee_id);
        const dept = emp ? departmentMap.get(emp.department_id) : null;
        return <span className="text-slate-600 font-medium">{dept || 'Unassigned'}</span>;
      },
    },
    {
      header: 'Attendance Date',
      accessor: 'attendance_date',
      sortable: true,
      render: (s) => <span className="font-medium text-slate-900">{formatDate(s.attendance_date)}</span>,
    },
    {
      header: 'First Check-in',
      accessor: 'first_check_in',
      sortable: true,
      render: (s) => (
        <span className="font-semibold text-slate-800">{s.first_check_in ? formatTime(s.first_check_in) : '—'}</span>
      ),
    },
    {
      header: 'Last Check-out',
      accessor: 'last_check_out',
      sortable: true,
      render: (s) => (
        <span className="text-slate-600">{s.last_check_out ? formatTime(s.last_check_out) : '—'}</span>
      ),
    },
    {
      header: 'Working Duration',
      accessor: 'total_working_minutes',
      sortable: true,
      render: (s) => (
        <span className="font-semibold text-slate-800">{formatMinutes(s.total_working_minutes)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} type="attendance" />,
    },
    {
      header: 'Action',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (s) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRecord(s);
            setIsDetailDrawerOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  // Logs Table Columns
  const logColumns = [
    {
      header: 'Employee',
      accessor: 'employee_id',
      sortable: true,
      render: (l) => {
        const emp = employeeMap.get(l.employee_id);
        const name = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unknown Employee';
        const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
        const avatarColor = getAvatarColor(name);

        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {emp?.employee_code || l.employee_id.substring(0, 8)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Event',
      accessor: 'event_type',
      sortable: true,
      render: (l) => <StatusBadge status={l.event_type} type="event" />,
    },
    {
      header: 'Recognition Time',
      accessor: 'recognition_time',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-semibold text-slate-900 block">{formatTime(l.recognition_time)}</span>
          <span className="text-[11px] text-slate-400">{formatDate(l.recognition_time)}</span>
        </div>
      ),
    },
    {
      header: 'Confidence',
      accessor: 'recognition_score',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {formatConfidence(l.recognition_score)}
        </span>
      ),
    },
    {
      header: 'Camera / Terminal',
      accessor: 'camera_name',
      render: (l) => <span className="text-slate-600">{l.camera_name || l.camera_id || 'Main Camera'}</span>,
    },
    {
      header: 'Type',
      accessor: 'recognition_type',
      render: (l) => <span className="font-mono text-[11px] text-slate-500">{l.recognition_type}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Attendance Hub"
        badgeIcon={CalendarCheck2}
        title="Attendance & Recognition Stream"
        description="Track daily workforce presence summaries, real-time facial recognition verification logs, and generate monthly reports."
        actions={
          <>
            <button
              onClick={() => navigate('recognition')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <ScanFace className="w-4 h-4 text-indigo-300" />
              Live Recognition
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Monthly Report
            </button>
          </>
        }
      />

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'summaries'
              ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80 -mb-1.5'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          Daily Summaries ({summaries.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80 -mb-1.5'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <ScanFace className="w-4 h-4" />
          Recognition Logs ({logs.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search employee name or code..."
            className="max-w-sm"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Date filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            {/* Department filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>

            {/* Status filter for summaries */}
            {activeTab === 'summaries' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            )}

            {(searchQuery || selectedDate || selectedDepartment || selectedStatus) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDate('');
                  setSelectedDepartment('');
                  setSelectedStatus('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === 'summaries' ? (
        <DataTable
          columns={summaryColumns}
          data={filteredSummaries}
          loading={loadingSummaries}
          emptyTitle="No attendance summaries found"
          emptyDescription="Try selecting a different date or adjusting your search filters."
          onRowClick={(s) => {
            setSelectedRecord(s);
            setIsDetailDrawerOpen(true);
          }}
        />
      ) : (
        <DataTable
          columns={logColumns}
          data={filteredLogs}
          loading={loadingLogs}
          emptyTitle="No recognition logs found"
          emptyDescription="Live face recognition events will populate here as employees pass terminals."
        />
      )}

      {/* Record Detail Drawer */}
      {selectedRecord && (
        <Drawer
          isOpen={isDetailDrawerOpen}
          onClose={() => {
            setIsDetailDrawerOpen(false);
            setSelectedRecord(null);
          }}
          title="Attendance Summary Details"
          subtitle={`Attendance for ${formatDate(selectedRecord.attendance_date)}`}
          size="md"
        >
          <div className="space-y-6 text-xs">
            {/* Employee Banner */}
            {(() => {
              const emp = employeeMap.get(selectedRecord.employee_id);
              const fullName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Employee';
              const initials = getInitials(emp?.first_name || 'E', emp?.last_name || 'E');
              const avatarColor = getAvatarColor(fullName);

              return (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-sm shadow-2xs ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{fullName}</h4>
                      <p className="text-slate-500 font-mono">{emp?.employee_code}</p>
                    </div>
                  </div>
                  <StatusBadge status={selectedRecord.status} type="attendance" />
                </div>
              );
            })()}

            {/* Timings Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">First Check-in</span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedRecord.first_check_in ? formatTime(selectedRecord.first_check_in) : 'None'}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Last Check-out</span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedRecord.last_check_out ? formatTime(selectedRecord.last_check_out) : 'None'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Total Working Duration</span>
              <p className="text-base font-bold text-indigo-700">
                {formatMinutes(selectedRecord.total_working_minutes)} ({selectedRecord.total_working_minutes} minutes)
              </p>
            </div>

            {selectedRecord.remarks && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Remarks / Notes</span>
                <p className="text-slate-700">{selectedRecord.remarks}</p>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* Monthly Report Modal */}
      <MonthlyReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
}

export default AttendancePage;
