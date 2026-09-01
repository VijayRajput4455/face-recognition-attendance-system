import apiClient from './client';

export const shiftsApi = {
  getAll: () => apiClient.get('/shifts'),
  getById: (id) => apiClient.get(`/shifts/${id}`),
  create: (data) => apiClient.post('/shifts', data),
  bulkCreate: (items) => apiClient.post('/shifts/bulk', { items }),
  bulkUpload: (formData) =>
    apiClient.post('/shifts/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => apiClient.put(`/shifts/${id}`, data),
  delete: (id) => apiClient.delete(`/shifts/${id}`),
};

export default shiftsApi;

