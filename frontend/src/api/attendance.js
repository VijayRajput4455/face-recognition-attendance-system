import apiClient from './client';

export const attendanceApi = {
  // Raw Attendance Logs
  getLogs: () => apiClient.get('/attendance/logs'),
  getLogsByEmployee: (employeeId) => apiClient.get(`/attendance/logs/employee/${employeeId}`),
  getLogById: (logId) => apiClient.get(`/attendance/logs/${logId}`),
  createLog: (data) => apiClient.post('/attendance/logs', data),
  deleteLog: (logId) => apiClient.delete(`/attendance/logs/${logId}`),

  // Attendance Summaries
  getSummaries: () => apiClient.get('/attendance/summaries'),
  getSummariesByEmployee: (employeeId) => apiClient.get(`/attendance/summaries/employee/${employeeId}`),
  getSummaryById: (summaryId) => apiClient.get(`/attendance/summaries/${summaryId}`),
  updateSummary: (summaryId, data) => apiClient.put(`/attendance/summaries/${summaryId}`, data),

  // Monthly Reports
  getMonthlyReport: (employeeId, month, year) =>
    apiClient.get(`/attendance/summaries/reports/monthly/${employeeId}`, {
      params: { month, year },
    }),
};

export default attendanceApi;
