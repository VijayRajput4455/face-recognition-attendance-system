import apiClient from './client';

export const getMilvusHealth = async () => {
  return await apiClient.get('/milvus/health');
};

export const getMilvusStats = async () => {
  return await apiClient.get('/milvus/stats');
};
