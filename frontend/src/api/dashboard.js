import apiClient from './client';

export const dashboardApi = {
  // 1. Core KPIs Summary
  getSummary: (params = {}) => apiClient.get('/dashboard/summary', { params }),

  // 2. Face Enrollment Breakdown (Donut)
  getEnrollmentOverview: (params = {}) =>
    apiClient.get('/dashboard/enrollment-overview', { params }),

  // 3. Face Enrollment Trajectory (Trend)
  getEnrollmentTrend: (params = {}) =>
    apiClient.get('/dashboard/enrollment-trend', { params }),

  // 4. Department Analytics Matrix
  getDepartments: (params = {}) => apiClient.get('/dashboard/departments', { params }),

  // 5. Shift Analytics
  getShifts: (params = {}) => apiClient.get('/dashboard/shifts', { params }),

  // 6. Designation Analytics
  getDesignations: (params = {}) => apiClient.get('/dashboard/designations', { params }),

  // 7. Employee Growth
  getEmployeeGrowth: (params = {}) =>
    apiClient.get('/dashboard/employee-growth', { params }),

  // 8. Recent Activity Feed
  getActivity: (params = {}) => apiClient.get('/dashboard/activity', { params }),

  // 9. AI Engine & System Health
  getSystemHealth: () => apiClient.get('/dashboard/system-health'),
};

export default dashboardApi;
