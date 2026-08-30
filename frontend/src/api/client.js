import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

function formatErrorMessage(error) {
  if (error.response) {
    const { status, data } = error.response;

    // Fastapi detail can be a string or validation array
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail.map((err) => `${err.loc?.slice(1)?.join('.') || 'field'}: ${err.msg}`).join(', ');
      }
    }

    switch (status) {
      case 400:
        return data?.message || 'Invalid request parameters. Please verify your input.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission for this operation.';
      case 404:
        return data?.message || 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. A record with this information already exists.';
      case 422:
        return 'Validation error. Please verify the submitted data.';
      case 500:
        return 'Internal server error occurred. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        return `Server returned error (${status}).`;
    }
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'The request timed out. Please check your connection and try again.';
  }

  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to reach the FaceAttend server. Please ensure the backend is running.';
  }

  return error.message || 'An unexpected error occurred.';
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const userMessage = formatErrorMessage(error);
    return Promise.reject(new Error(userMessage));
  }
);

export default apiClient;
