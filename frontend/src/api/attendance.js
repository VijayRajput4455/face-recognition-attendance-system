import apiClient from './client';

export const getAttendanceLogs = async (params = {}) => {
  return await apiClient.get('/attendance/logs', { params });
};

export const getAttendanceSummaries = async (params = {}) => {
  return await apiClient.get('/attendance/summaries', { params });
};
