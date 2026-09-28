// ============================================================
// Centralized API Configuration & Environment Management
// ============================================================

export type ApiEnvironment = 'QA' | 'PROD';

export interface EnvironmentInfo {
  id: ApiEnvironment;
  name: string;
  url: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
}

export const API_ENVIRONMENTS: Record<ApiEnvironment, EnvironmentInfo> = {
  QA: {
    id: 'QA',
    name: 'QA',
    url: 'https://qa-gway001.tristargroup.net',
    badgeColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    badgeBorder: 'rgba(56, 189, 248, 0.3)',
    description: 'QA Gateway (https://qa-gway001.tristargroup.net)',
  },
  PROD: {
    id: 'PROD',
    name: 'PROD',
    url: 'https://tristarconnect.net',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    description: 'Production (https://tristarconnect.net)',
  },
};

const STORAGE_KEY = 'report_json_update_api_env';

export function getStoredEnvironment(): ApiEnvironment {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) as ApiEnvironment | null;
    if (stored && (stored === 'QA' || stored === 'PROD')) {
      return stored;
    }
  }
  return 'QA';
}

export function setStoredEnvironment(env: ApiEnvironment) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, env);
    window.dispatchEvent(new CustomEvent('api-environment-changed', { detail: env }));
  }
}

export function getApiBaseUrl(): string {
  const env = getStoredEnvironment();
  return API_ENVIRONMENTS[env]?.url || API_ENVIRONMENTS.QA.url;
}

export function getApiEndpoints() {
  const baseUrl = getApiBaseUrl();
  return {
    SEARCH_FILES: `${baseUrl}/reports/generatorservice/api/gitlab/files`,
    GENERATE_REPORT: (apiPath: string) =>
      `${baseUrl}/reports/generatorservice/api/v1/generate/${apiPath}`,
    GET_FILE: `${baseUrl}/reports/generatorservice/api/gitlab/file`,
    BRANCHES: `${baseUrl}/reports/generatorservice/api/gitlab/branches`,
    UPDATE_FILE: `${baseUrl}/reports/generatorservice/api/gitlab/file`,
    MERGE_REQUESTS: `${baseUrl}/reports/generatorservice/api/gitlab/merge-requests`,
  };
}

// Dynamic getter object for endpoints
export const API_ENDPOINTS = {
  get SEARCH_FILES() {
    return `${getApiBaseUrl()}/reports/generatorservice/api/gitlab/files`;
  },
  GENERATE_REPORT(apiPath: string) {
    return `${getApiBaseUrl()}/reports/generatorservice/api/v1/generate/${apiPath}`;
  },
  get GET_FILE() {
    return `${getApiBaseUrl()}/reports/generatorservice/api/gitlab/file`;
  },
  get BRANCHES() {
    return `${getApiBaseUrl()}/reports/generatorservice/api/gitlab/branches`;
  },
  get UPDATE_FILE() {
    return `${getApiBaseUrl()}/reports/generatorservice/api/gitlab/file`;
  },
  get MERGE_REQUESTS() {
    return `${getApiBaseUrl()}/reports/generatorservice/api/gitlab/merge-requests`;
  },
};

export const API_BASE_URL = getApiBaseUrl();
