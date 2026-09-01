import { apiClient } from './client';

export const designationsApi = {
  // GET /api/v1/designations
  getAll: async () => {
    return apiClient.get('/designations');
  },

  // GET /api/v1/designations/{id}
  getById: async (id) => {
    return apiClient.get(`/designations/${id}`);
  },

  // POST /api/v1/designations
  create: async (data) => {
    return apiClient.post('/designations', data);
  },

  // POST /api/v1/designations/bulk
  bulkCreate: async (items) => {
    return apiClient.post('/designations/bulk', { items });
  },

  // POST /api/v1/designations/bulk-upload
  bulkUpload: async (formData) => {
    return apiClient.post('/designations/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // PUT /api/v1/designations/{id}
  update: async (id, data) => {
    return apiClient.put(`/designations/${id}`, data);
  },

  // DELETE /api/v1/designations/{id}
  delete: async (id) => {
    return apiClient.delete(`/designations/${id}`);
  },
};

export default designationsApi;

