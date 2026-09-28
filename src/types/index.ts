// ============================================================
// Core Types & Interfaces
// ============================================================

export interface Repository {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  configFiles: number;
  status: 'connected' | 'disconnected' | 'error';
  gitlabUrl?: string;
  defaultBranch: string;
}

export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  lastModified: string;
  size: number;
}

export interface Branch {
  name: string;
  commit: string;
  isDefault: boolean;
}

export interface CommitInfo {
  id: string;
  shortId: string;
  message: string;
  author: string;
  timestamp: string;
}

export interface MergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  repository: string;
  repositoryId: string;
  file: string;
  author: string;
  createdAt: string;
  status: MergeRequestStatus;
  commitId: string;
  webUrl?: string;
}

export type MergeRequestStatus = 'opened' | 'merged' | 'closed' | 'failed';

export interface UpdateRecord {
  id: string;
  date: string;
  repository: string;
  repositoryId: string;
  file: string;
  branch: string;
  commitId: string;
  mergeRequestIid: number;
  user: string;
  status: MergeRequestStatus;
}

export interface JsonDiff {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  key: string;
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

export interface UpdatePayload {
  repositoryId: string;
  filePath: string;
  content: string;
  commitMessage: string;
  ticketId?: string;
}

export interface UpdateResult {
  success: boolean;
  branch: string;
  commitId: string;
  commitShortId: string;
  mergeRequestIid: number;
  mergeRequestUrl: string;
  commitUrl: string;
  error?: string;
}

export interface WorkflowStep {
  id: number;
  label: string;
  key: 'repository' | 'configuration' | 'edit' | 'review' | 'merge-request';
}

export interface AppSettings {
  gitlabUrl: string;
  defaultBranch: string;
  branchPattern: string;
  commitPattern: string;
  jsonValidation: {
    strictMode: boolean;
    maxDepth: number;
    maxSize: number;
  };
}

export interface User {
  username?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface GitLabStatus {
  connected: boolean;
  url: string;
  lastChecked: string;
}

export interface GitLabSearchFile {
  name: string;
  path: string;
  type: string;
}

export interface GitLabCreateBranchPayload {
  baseBranch: 'qa' | 'master' | string;
  newBranch: string;
}

export interface GitLabCreateBranchResponse {
  success: boolean;
  branch: string;
  baseBranch: string;
  message: string;
}

export interface GitLabUpdateFilePayload {
  branch: string;
  filePath: string;
  content: string;
  commitMessage: string;
}

export interface GitLabUpdateFileResponse {
  success?: boolean;
  message?: string;
  filePath?: string;
  branch?: string;
  commitId?: string;
  [key: string]: any;
}

export interface GitLabCreateMergeRequestPayload {
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description: string;
}

export interface GitLabCreateMergeRequestResponse {
  success: boolean;
  mergeRequestId: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  webUrl: string;
  message?: string;
}

