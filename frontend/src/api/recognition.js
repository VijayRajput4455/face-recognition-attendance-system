import apiClient from './client';

export const recognitionApi = {
  recognizeImage: (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return apiClient.post('/recognition/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default recognitionApi;
