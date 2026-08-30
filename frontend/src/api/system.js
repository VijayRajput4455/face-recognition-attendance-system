import apiClient from './client';
import milvusApi from './milvus';

export const systemApi = {
  getAggregateHealth: async () => {
    try {
      const milvusHealth = await milvusApi.getHealth().catch(() => ({ status: 'unhealthy' }));
      return {
        api: { status: 'healthy', timestamp: new Date().toISOString() },
        milvus: milvusHealth,
      };
    } catch {
      return {
        api: { status: 'degraded' },
        milvus: { status: 'unknown' },
      };
    }
  },
};

export default systemApi;
