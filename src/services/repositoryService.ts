// ============================================================
// Repository Service
// ============================================================
import { gitlabApi } from '../api/gitlabApi';
import type { Repository } from '../types';

export const repositoryService = {
  async getAll(): Promise<Repository[]> {
    return gitlabApi.getRepositories();
  },

  async getById(id: string): Promise<Repository | undefined> {
    return gitlabApi.getRepository(id);
  },

  async search(query: string): Promise<Repository[]> {
    const repos = await gitlabApi.getRepositories();
    if (!query.trim()) return repos;
    const lower = query.toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower)
    );
  },
};
