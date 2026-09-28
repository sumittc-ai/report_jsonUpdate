// ============================================================
// GitLab API Client
// ============================================================
import type {
  Repository,
  ConfigFile,
  MergeRequest,
  UpdateRecord,
  UpdatePayload,
  UpdateResult,
  AppSettings,
} from '../types';
import {
  mockRepositories,
  mockConfigFiles,
  getJsonContent,
  mockMergeRequests,
  mockUpdateHistory,
  mockSettings,
} from '../data/mockData';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min = 400, max = 1200) => delay(min + Math.random() * (max - min));

// ============================================================
// API Client — Mock Implementation
// Replace with real HTTP calls when backend is ready
// ============================================================

export const gitlabApi = {
  // ----------------------------------------------------------
  // Repositories
  // ----------------------------------------------------------
  async getRepositories(): Promise<Repository[]> {
    await randomDelay(300, 800);
    return mockRepositories;
  },

  async getRepository(id: string): Promise<Repository | undefined> {
    await randomDelay(200, 500);
    return mockRepositories.find((r) => r.id === id);
  },

  // ----------------------------------------------------------
  // Configuration Files
  // ----------------------------------------------------------
  async getConfigFiles(repositoryId: string): Promise<ConfigFile[]> {
    await randomDelay(400, 900);
    return mockConfigFiles[repositoryId] || [];
  },

  async getFileContent(repositoryId: string, fileId: string): Promise<string> {
    await randomDelay(500, 1000);
    void repositoryId; // Used in real implementation
    return getJsonContent(fileId);
  },

  // ----------------------------------------------------------
  // JSON Validation
  // ----------------------------------------------------------
  async validateJson(content: string): Promise<{ valid: boolean; error?: string; line?: number }> {
    await delay(100);
    try {
      JSON.parse(content);
      return { valid: true };
    } catch (e) {
      const error = e as SyntaxError;
      const match = error.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1], 10) : 0;
      const lines = content.substring(0, position).split('\n');
      return {
        valid: false,
        error: error.message,
        line: lines.length,
      };
    }
  },

  // ----------------------------------------------------------
  // Update Workflow (Create Branch → Commit → MR)
  // ----------------------------------------------------------
  async createUpdate(payload: UpdatePayload): Promise<UpdateResult> {
    const { ticketId, commitMessage } = payload;
    
    // Simulate the multi-step GitLab workflow
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
    const branchSuffix = ticketId ? `${ticketId}-${timestamp}` : `config-${timestamp}`;
    const branch = `json-update/${branchSuffix}`;
    
    const commitShortId = Math.random().toString(16).substring(2, 9);
    const mrIid = 2482 + Math.floor(Math.random() * 100);

    // Step 1: Create branch (simulated)
    await delay(1500);

    // Step 2: Update file (simulated)
    await delay(1200);

    // Step 3: Create commit (simulated)
    await delay(800);

    // Step 4: Create merge request (simulated)
    await delay(1000);

    return {
      success: true,
      branch,
      commitId: commitShortId + Math.random().toString(16).substring(2, 5),
      commitShortId,
      mergeRequestIid: mrIid,
      mergeRequestUrl: `https://gitlab.company.com/reports/${branch}/-/merge_requests/${mrIid}`,
      commitUrl: `https://gitlab.company.com/reports/-/commit/${commitShortId}`,
    };
  },

  // ----------------------------------------------------------
  // Merge Requests
  // ----------------------------------------------------------
  async getMergeRequests(): Promise<MergeRequest[]> {
    await randomDelay(400, 800);
    return mockMergeRequests;
  },

  async getMergeRequest(id: number): Promise<MergeRequest | undefined> {
    await randomDelay(200, 500);
    return mockMergeRequests.find((mr) => mr.id === id);
  },

  // ----------------------------------------------------------
  // History
  // ----------------------------------------------------------
  async getUpdateHistory(): Promise<UpdateRecord[]> {
    await randomDelay(400, 800);
    return mockUpdateHistory;
  },

  // ----------------------------------------------------------
  // Settings
  // ----------------------------------------------------------
  async getSettings(): Promise<AppSettings> {
    await randomDelay(200, 400);
    return mockSettings;
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    await randomDelay(300, 600);
    return { ...mockSettings, ...settings };
  },

  // ----------------------------------------------------------
  // GitLab Status
  // ----------------------------------------------------------
  async checkConnection(): Promise<{ connected: boolean; url: string }> {
    await delay(300);
    return {
      connected: true,
      url: 'https://gitlab.company.com',
    };
  },

  // ----------------------------------------------------------
  // Search GitLab Report Files
  // ----------------------------------------------------------
  async searchReportFiles(branch: 'qa' | 'master', searchParam: string): Promise<import('../types').GitLabSearchFile[]> {
    const rawSearch = searchParam.trim();
    const formattedSearch = rawSearch.startsWith('report_') ? rawSearch : `report_${rawSearch}`;
    const url = `http://localhost:8008/reports/generatorservice/api/gitlab/files?branch=${encodeURIComponent(branch)}&search=${encodeURIComponent(formattedSearch)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      console.warn('Direct API call to localhost:8008 failed, checking error:', err);
      throw err;
    }
  },

  // ----------------------------------------------------------

  // Generate Report Configuration JSON
  // 3 digits -> dynamic report (getReportConfigJSONDynamicWithReport)
  // 5 digits -> hycile report (getReportConfigJSONWithReport)
  // ----------------------------------------------------------
  async generateReportConfig(
    reportId: string | number,
    mode?: 'auto' | 'dynamic' | 'hycile'
  ): Promise<any> {
    const cleanId = String(reportId).trim().replace(/^report_/, '').replace(/\.json$/, '');
    if (!cleanId) {
      throw new Error('Report ID cannot be empty');
    }

    const isHycile = mode === 'hycile' ? true : mode === 'dynamic' ? false : cleanId.length >= 5;
    const apiPath = isHycile ? 'getReportConfigJSONWithReport' : 'getReportConfigJSONDynamicWithReport';
    const url = `http://localhost:8008/reports/generatorservice/api/v1/generate/${apiPath}?reportId=${encodeURIComponent(
      cleanId
    )}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      console.warn(`Generate report API failed for ID ${cleanId}:`, err);
      throw err;
    }
  },

  // ----------------------------------------------------------
  // Get Single GitLab File Content
  // ----------------------------------------------------------
  async getGitlabFileContent(
    branch: string,
    filePath: string
  ): Promise<{ filePath: string; branch: string; content: any; encoding?: string }> {
    const url = `http://localhost:8008/reports/generatorservice/api/gitlab/file?branch=${encodeURIComponent(
      branch
    )}&filePath=${encodeURIComponent(filePath)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      console.warn('Get GitLab file content failed:', err);
      throw err;
    }
  },

  // ----------------------------------------------------------
  // Create GitLab Branch
  // ----------------------------------------------------------
  async createBranch(payload: import('../types').GitLabCreateBranchPayload): Promise<import('../types').GitLabCreateBranchResponse> {
    const url = 'http://localhost:8008/reports/generatorservice/api/gitlab/branches';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMessage = `Server returned HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMessage = errData.message;
          }
        } catch {
          // Ignore JSON parse error on response body
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      console.warn('Create branch API failed:', err);
      throw err;
    }
  },

  // ----------------------------------------------------------
  // Update GitLab File Content
  // ----------------------------------------------------------
  async updateGitlabFile(payload: import('../types').GitLabUpdateFilePayload): Promise<import('../types').GitLabUpdateFileResponse> {
    const url = 'http://localhost:8008/reports/generatorservice/api/gitlab/file';

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMessage = `Server returned HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMessage = errData.message;
          }
        } catch {
          // Ignore JSON parse error
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      console.warn('Update GitLab file API failed:', err);
      throw err;
    }
  },

  // ----------------------------------------------------------
  // Create GitLab Merge Request
  // ----------------------------------------------------------
  async createMergeRequest(
    payload: import('../types').GitLabCreateMergeRequestPayload
  ): Promise<import('../types').GitLabCreateMergeRequestResponse> {
    const url = 'http://localhost:8008/reports/generatorservice/api/gitlab/merge-requests';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMessage = `Server returned HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMessage = errData.message;
          }
        } catch {
          // Ignore JSON parse error
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      console.warn('Create GitLab Merge Request API failed:', err);
      throw err;
    }
  },
};



