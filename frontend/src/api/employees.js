import apiClient from './client';

export const employeesApi = {
  getAll: (params = {}) => apiClient.get('/employees', { params }),
  getById: (id) => apiClient.get(`/employees/${id}`),
  getByCode: (code) => apiClient.get(`/employees/code/${code}`),
  getByDepartment: (deptId) => apiClient.get(`/employees/department/${deptId}`),
  getByShift: (shiftId) => apiClient.get(`/employees/shift/${shiftId}`),
  getByStatus: (status) => apiClient.get(`/employees/status/${status}`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.put(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

export default employeesApi;
