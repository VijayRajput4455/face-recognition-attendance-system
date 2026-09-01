import apiClient from './client';

export const departmentsApi = {
  getAll: () => apiClient.get('/departments'),
  getById: (id) => apiClient.get(`/departments/${id}`),
  create: (data) => apiClient.post('/departments', data),
  bulkCreate: (items) => apiClient.post('/departments/bulk', { items }),
  bulkUpload: (formData) =>
    apiClient.post('/departments/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => apiClient.put(`/departments/${id}`, data),
  delete: (id) => apiClient.delete(`/departments/${id}`),
};

export default departmentsApi;

