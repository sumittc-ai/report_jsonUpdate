// ============================================================
// Update Service — orchestrates the full workflow
// ============================================================
import { gitlabApi } from '../api/gitlabApi';
import type { UpdatePayload, UpdateResult } from '../types';

export type UpdateStep = 'branch' | 'file' | 'commit' | 'merge-request';
export type StepStatus = 'pending' | 'running' | 'success' | 'error';

export interface UpdateProgress {
  step: UpdateStep;
  status: StepStatus;
  message: string;
}

export const updateService = {
  async executeUpdate(
    payload: UpdatePayload,
    onProgress: (progress: UpdateProgress) => void
  ): Promise<UpdateResult> {
    // Step 1: Creating branch
    onProgress({ step: 'branch', status: 'running', message: 'Creating branch...' });
    await new Promise((r) => setTimeout(r, 1500));
    onProgress({ step: 'branch', status: 'success', message: 'Branch created' });

    // Step 2: Updating file
    onProgress({ step: 'file', status: 'running', message: 'Updating JSON file...' });
    await new Promise((r) => setTimeout(r, 1200));
    onProgress({ step: 'file', status: 'success', message: 'File updated' });

    // Step 3: Creating commit
    onProgress({ step: 'commit', status: 'running', message: 'Creating commit...' });
    await new Promise((r) => setTimeout(r, 800));
    onProgress({ step: 'commit', status: 'success', message: 'Commit created' });

    // Step 4: Creating merge request
    onProgress({ step: 'merge-request', status: 'running', message: 'Creating merge request...' });
    await new Promise((r) => setTimeout(r, 1000));
    onProgress({ step: 'merge-request', status: 'success', message: 'Merge request created' });

    // Final result from the API
    const result = await gitlabApi.createUpdate(payload);
    return result;
  },
};
