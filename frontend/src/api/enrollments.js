import apiClient from './client';

export const enrollmentsApi = {
  getAll: () => apiClient.get('/enrollments'),
  getById: (id) => apiClient.get(`/enrollments/${id}`),
  getByEmployeeId: (employeeId) => apiClient.get(`/enrollments/employee/${employeeId}`),
  
  startEnrollment: (employeeId, videoFile) => {
    const formData = new FormData();
    formData.append('employee_id', employeeId);
    formData.append('video_file', videoFile);
    return apiClient.post('/enrollments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  startWithImages: (employeeId, imageFiles) => {
    const formData = new FormData();
    formData.append('employee_id', employeeId);
    imageFiles.forEach((file) => {
      formData.append('image_files', file);
    });
    return apiClient.post('/enrollments/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  retry: (enrollmentId) => apiClient.post(`/enrollments/${enrollmentId}/retry`),
  delete: (id) => apiClient.delete(`/enrollments/${id}`),
  deleteByEmployeeId: (employeeId) => apiClient.delete(`/enrollments/employee/${employeeId}`),
};

export default enrollmentsApi;
