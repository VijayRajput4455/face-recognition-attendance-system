import apiClient from './client';

export const identifyFace = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await apiClient.post('/recognition/identify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
