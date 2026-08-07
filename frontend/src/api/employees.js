import apiClient from './client';

export const getEmployees = async (params = {}) => {
  return await apiClient.get('/employees', { params });
};

export const getEmployeeById = async (id) => {
  return await apiClient.get(`/employees/${id}`);
};

export const createEmployee = async (employeeData) => {
  return await apiClient.post('/employees', employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return await apiClient.put(`/employees/${id}`, employeeData);
};

export const deleteEmployee = async (id) => {
  return await apiClient.delete(`/employees/${id}`);
};

export const getDepartments = async () => {
  return await apiClient.get('/departments');
};

export const createDepartment = async (departmentData) => {
  return await apiClient.post('/departments', departmentData);
};

export const getShifts = async () => {
  return await apiClient.get('/shifts');
};

export const createShift = async (shiftData) => {
  return await apiClient.post('/shifts', shiftData);
};
