import apiClient from './client';

export const milvusApi = {
  getCount: () => apiClient.get('/milvus/count'),
  getEmployees: () => apiClient.get('/milvus/employees'),
  getEmployeeById: (employeeId) => apiClient.get(`/milvus/employee/${employeeId}`),
  getEmployeeByCode: (employeeCode) => apiClient.get(`/milvus/employee/code/${employeeCode}`),
  getInfo: () => apiClient.get('/milvus/info'),
  getConfig: () => apiClient.get('/milvus/config'),
  getHealth: () => apiClient.get('/milvus/health'),
  deleteEmployee: (employeeId) => apiClient.delete(`/milvus/employee/${employeeId}`),
  deleteAll: () => apiClient.delete('/milvus/all'),
};

export default milvusApi;
