import apiClient from './client';

export const uploadEnrollmentVideo = async (employeeId, file) => {
  const formData = new FormData();
  formData.append('employee_id', employeeId);
  formData.append('video_file', file);

  try {
    return await apiClient.post('/enrollments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    // Fallback attempt to /enrollments/upload if custom route used
    try {
      const fallbackFormData = new FormData();
      fallbackFormData.append('employee_id', employeeId);
      fallbackFormData.append('file', file);
      return await apiClient.post('/enrollments/upload', fallbackFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (e) {
      throw error;
    }
  }
};

export const getEnrollments = async () => {
  return await apiClient.get('/enrollments');
};

export const getEnrollmentById = async (enrollmentId) => {
  return await apiClient.get(`/enrollments/${enrollmentId}`);
};

export const getEmployeeEnrollments = async (employeeId) => {
  return await apiClient.get(`/enrollments/employee/${employeeId}`);
};

export const retryEnrollment = async (enrollmentId) => {
  return await apiClient.post(`/enrollments/${enrollmentId}/retry`);
};
