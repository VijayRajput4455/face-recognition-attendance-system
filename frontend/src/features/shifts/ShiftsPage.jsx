import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '../../api/shifts';
import { employeesApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import PageBanner from '../../components/ui/PageBanner';
import { cn } from '../../lib/utils';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  Timer,
  Layers,
  Loader2,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';

export function ShiftsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('18:00:00');
  const [graceMinutes, setGraceMinutes] = useState(15);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState(''); // '' | 'staffed' | 'empty'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'time' | 'staff-desc'

  // 1. Fetch Shifts
  const { data: shifts = [], isLoading: loadingShifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: shiftsApi.getAll,
  });

  // 2. Fetch Employees for workforce count
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // Shift staff mapping
  const shiftStaffMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      if (emp.shift_id) {
        map.set(emp.shift_id, (map.get(emp.shift_id) || 0) + 1);
      }
    });
    return map;
  }, [employees]);

  // Metric Calculations
  const totalShiftsCount = shifts.length;
  const assignedEmployeesCount = useMemo(() => {
    return employees.filter((emp) => Boolean(emp.shift_id)).length;
  }, [employees]);

  const staffedShiftsCount = useMemo(() => {
    return shifts.filter((shift) => (shiftStaffMap.get(shift.id) || 0) > 0).length;
  }, [shifts, shiftStaffMap]);

  const emptyShiftsCount = useMemo(() => {
    return shifts.filter((shift) => (shiftStaffMap.get(shift.id) || 0) === 0).length;
  }, [shifts, shiftStaffMap]);

  const avgGraceMinutes = useMemo(() => {
    if (shifts.length === 0) return 0;
    const total = shifts.reduce((acc, s) => acc + (s.grace_minutes || 0), 0);
    return Math.round(total / shifts.length);
  }, [shifts]);

  // Columns for DataTable List View
  const shiftColumns = [
    {
      header: 'Shift Name',
      accessor: 'shift_name',
      render: (shift) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 leading-tight">{shift.shift_name}</div>
            <div className="text-[11px] text-slate-400 font-normal">Operational Work Shift</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Schedule Time',
      accessor: 'start_time',
      render: (shift) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            {shift.start_time} - {shift.end_time}
          </span>
        </div>
      ),
    },
    {
      header: 'Grace Period',
      accessor: 'grace_minutes',
      render: (shift) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          <Timer className="w-3 h-3 text-slate-500" />
          {shift.grace_minutes || 0} mins
        </span>
      ),
    },
    {
      header: 'Assigned Staff',
      accessor: 'staffCount',
      render: (shift) => {
        const count = shiftStaffMap.get(shift.id) || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {count}
            </span>
            <span className="text-xs text-slate-500">
              {count === 1 ? 'Employee' : 'Employees'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (shift) => {
        const count = shiftStaffMap.get(shift.id) || 0;
        return count > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active Shift</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border bg-slate-100 text-slate-600 border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Unassigned</span>
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (shift) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenEdit(shift)}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Edit Shift"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(shift)}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Delete Shift"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filtered & Sorted Shifts
  const filteredShifts = useMemo(() => {
    return shifts
      .filter((shift) => {
        // Search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const nameMatch = shift.shift_name.toLowerCase().includes(query);
          const timeMatch = `${shift.start_time} ${shift.end_time}`.toLowerCase().includes(query);
          if (!nameMatch && !timeMatch) return false;
        }

        // Staffing Filter
        const staffCount = shiftStaffMap.get(shift.id) || 0;
        if (staffFilter === 'staffed' && staffCount === 0) return false;
        if (staffFilter === 'empty' && staffCount > 0) return false;

        return true;
      })
      .sort((a, b) => {
        const countA = shiftStaffMap.get(a.id) || 0;
        const countB = shiftStaffMap.get(b.id) || 0;
        if (sortBy === 'staff-desc') return countB - countA;
        if (sortBy === 'time') return (a.start_time || '').localeCompare(b.start_time || '');
        return a.shift_name.localeCompare(b.shift_name);
      });
  }, [shifts, searchQuery, staffFilter, sortBy, shiftStaffMap]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => shiftsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success('Shift Created', 'New work shift has been established.');
      handleCloseModal();
    },
    onError: (err) => toastError('Creation Failed', err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shiftsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success('Shift Updated', 'Shift changes have been saved.');
      handleCloseModal();
    },
    onError: (err) => toastError('Update Failed', err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => shiftsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success('Shift Deleted', 'The shift was removed.');
      setDeleteTarget(null);
    },
    onError: (err) => toastError('Deletion Failed', err.message),
  });

  const handleOpenCreate = () => {
    setEditingShift(null);
    setShiftName('');
    setStartTime('09:00:00');
    setEndTime('18:00:00');
    setGraceMinutes(15);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.shift_name);
    setStartTime(shift.start_time || '09:00:00');
    setEndTime(shift.end_time || '18:00:00');
    setGraceMinutes(shift.grace_minutes ?? 15);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      toastError('Validation Error', 'Shift name is required.');
      return;
    }

    // Ensure seconds are included if not present (format HH:MM:SS)
    const formatTimeWithSeconds = (t) => {
      if (!t) return '09:00:00';
      return t.split(':').length === 2 ? `${t}:00` : t;
    };

    const payload = {
      shift_name: shiftName.trim(),
      start_time: formatTimeWithSeconds(startTime),
      end_time: formatTimeWithSeconds(endTime),
      grace_minutes: parseInt(graceMinutes, 10) || 0,
    };

    if (editingShift) {
      updateMutation.mutate({ id: editingShift.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Shift Scheduling"
        badgeIcon={Clock}
        title="Work Shifts & Schedules"
        description="Configure standard shift operational hours, late arrival grace windows, and roster allocations."
      />

      {/* Real-Time Blue Theme Metric Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shifts Toggle */}
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setStaffFilter('');
            setSortBy('name');
          }}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            !searchQuery && !staffFilter && sortBy === 'name'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Shifts
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {totalShiftsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">All Schedules</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        {/* Assigned Staff */}
        <button
          type="button"
          onClick={() => setStaffFilter('')}
          className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]"
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Assigned Staff
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {assignedEmployeesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {employees.length > 0 ? Math.round((assignedEmployeesCount / employees.length) * 100) : 0}% On Roster
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
        </button>

        {/* Active Staffed Shifts Toggle */}
        <button
          type="button"
          onClick={() => setStaffFilter(staffFilter === 'staffed' ? '' : 'staffed')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            staffFilter === 'staffed'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Active Rosters
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {staffedShiftsCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {totalShiftsCount > 0 ? Math.round((staffedShiftsCount / totalShiftsCount) * 100) : 0}% Staffed
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>

        {/* Avg Grace Period */}
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setStaffFilter('');
            setSortBy('time');
          }}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            sortBy === 'time'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Avg Grace Period
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {avgGraceMinutes}m
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">Standard Window</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Timer className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Search & Filter Toolbar with Add Shift Action */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search shifts by name or timing (e.g. 09:00)..."
              className="w-full md:max-w-xs"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Staffing Filter */}
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Shifts</option>
                <option value="staffed">Staffed Rosters ({staffedShiftsCount})</option>
                <option value="empty">Unstaffed Shifts ({emptyShiftsCount})</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="name">Sort by Name (A-Z)</option>
                <option value="time">Start Time (Early to Late)</option>
                <option value="staff-desc">Most Staff (High to Low)</option>
              </select>

              {(searchQuery || staffFilter || sortBy !== 'name') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStaffFilter('');
                    setSortBy('name');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Add Shift Action & View Toggle */}
          <div className="flex items-center gap-2.5 justify-between sm:justify-end pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              Add Shift
            </button>
          </div>
        </div>
      </div>

      {/* View Mode: List or Grid */}
      {viewMode === 'list' ? (
        <DataTable
          columns={shiftColumns}
          data={filteredShifts}
          isLoading={loadingShifts}
          emptyMessage="No matching shifts found."
        />
      ) : loadingShifts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredShifts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">
            {searchQuery || staffFilter ? 'No matching shifts' : 'No shifts configured'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {searchQuery || staffFilter
              ? 'Try clearing your search or filters to see all operational shifts.'
              : 'Create your first work shift to track attendance.'}
          </p>
          {searchQuery || staffFilter ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStaffFilter('');
                setSortBy('name');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl cursor-pointer"
            >
              Add Shift
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map((shift) => {
            const count = shiftStaffMap.get(shift.id) || 0;

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(shift)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(shift)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{shift.shift_name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {shift.start_time} - {shift.end_time}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        +{shift.grace_minutes || 0}m grace
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {count} Assigned {count === 1 ? 'Employee' : 'Employees'}
                    </span>
                  </div>

                  {count > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      Active Shift
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingShift ? 'Edit Shift Schedule' : 'Create New Shift'}
        description="Set operational work hours and grace minutes for late calculation."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shift Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              placeholder="e.g. Morning Shift, Evening Shift"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grace Period (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Arrivals within grace minutes will be marked as PRESENT without late penalty.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingShift ? 'Save Changes' : 'Create Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        isLoading={deleteMutation.isPending}
        danger
        title="Delete Shift Schedule?"
        description={`Are you sure you want to delete ${deleteTarget?.shift_name}? Assigned employees will default to standard shift.`}
        confirmText="Delete Shift"
      />
    </div>
  );
}

export default ShiftsPage;
