import apiClient from './client';

export const uploadEnrollmentVideo = async (employeeId, file) => {
  const formData = new FormData();
  formData.append('employee_id', employeeId);
  formData.append('file', file);

  return await apiClient.post('/enrollments/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getEnrollmentStatus = async (employeeId) => {
  return await apiClient.get(`/enrollments/${employeeId}`);
};
