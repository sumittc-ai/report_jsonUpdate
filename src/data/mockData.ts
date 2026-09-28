// ============================================================
// Mock Data
// ============================================================
import type {
  Repository,
  ConfigFile,
  MergeRequest,
  UpdateRecord,
  User,
  AppSettings,
} from '../types';

export const mockUser: User = {
  name: 'Sumit Kumar',
  email: 'sumit.kumar@company.com',
  role: 'DevOps Engineer',
};

export const mockRepositories: Repository[] = [
  {
    id: 'repo-1',
    name: 'Report-Group-1-Microservices',
    description: 'Report generation services for Group 1 clients',
    lastUpdated: '2026-09-14T08:30:00Z',
    configFiles: 12,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-2',
    name: 'Report-Group-2-Microservices',
    description: 'Report generation services for Group 2 clients',
    lastUpdated: '2026-09-13T14:20:00Z',
    configFiles: 8,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-10',
    name: 'Report-Group-10-Microservices',
    description: 'Report generation services for Group 10 clients',
    lastUpdated: '2026-09-12T16:45:00Z',
    configFiles: 15,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-11',
    name: 'Report-Group-11-Microservices',
    description: 'Report processing and delivery for Group 11',
    lastUpdated: '2026-09-14T10:15:00Z',
    configFiles: 6,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-12',
    name: 'Report-Group-12-Microservices',
    description: 'Batch report generation for Group 12',
    lastUpdated: '2026-09-11T09:30:00Z',
    configFiles: 10,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-13',
    name: 'Report-Group-13-Microservices',
    description: 'Real-time report services for Group 13',
    lastUpdated: '2026-09-14T07:00:00Z',
    configFiles: 9,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-dyn-1',
    name: 'Report-Dynamic-Group-1-Microservices',
    description: 'Dynamic report configuration services for Group 1',
    lastUpdated: '2026-09-13T18:00:00Z',
    configFiles: 14,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-dyn-2',
    name: 'Report-Dynamic-Group-2-Microservices',
    description: 'Dynamic report configuration services for Group 2',
    lastUpdated: '2026-09-10T11:45:00Z',
    configFiles: 7,
    status: 'disconnected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-dynamic',
    name: 'DynamicReportMicroservices',
    description: 'Core dynamic report generation engine',
    lastUpdated: '2026-09-14T12:00:00Z',
    configFiles: 20,
    status: 'connected',
    defaultBranch: 'master',
  },
  {
    id: 'repo-process',
    name: 'ProcessReportMicroservices',
    description: 'Report processing pipeline and queue management',
    lastUpdated: '2026-09-14T06:30:00Z',
    configFiles: 11,
    status: 'connected',
    defaultBranch: 'master',
  },
];

export const mockConfigFiles: Record<string, ConfigFile[]> = {
  'repo-1': [
    { id: 'f1', name: 'application.json', path: 'src/main/resources/application.json', lastModified: '2026-09-14T08:30:00Z', size: 2048 },
    { id: 'f2', name: 'report-config.json', path: 'src/main/resources/report-config.json', lastModified: '2026-09-13T14:00:00Z', size: 4096 },
    { id: 'f3', name: 'report.json', path: 'config/report.json', lastModified: '2026-09-12T10:00:00Z', size: 1024 },
    { id: 'f4', name: 'config.json', path: 'config/config.json', lastModified: '2026-09-14T07:00:00Z', size: 512 },
  ],
  'repo-2': [
    { id: 'f5', name: 'application.json', path: 'src/main/resources/application.json', lastModified: '2026-09-13T14:20:00Z', size: 2560 },
    { id: 'f6', name: 'report-config.json', path: 'src/main/resources/report-config.json', lastModified: '2026-09-12T09:00:00Z', size: 3072 },
    { id: 'f7', name: 'config.json', path: 'config/config.json', lastModified: '2026-09-11T16:00:00Z', size: 768 },
  ],
  'repo-10': [
    { id: 'f8', name: 'application.json', path: 'src/main/resources/application.json', lastModified: '2026-09-12T16:45:00Z', size: 1536 },
    { id: 'f9', name: 'report.json', path: 'config/report.json', lastModified: '2026-09-11T12:00:00Z', size: 2048 },
    { id: 'f10', name: 'scheduler-config.json', path: 'config/scheduler-config.json', lastModified: '2026-09-10T08:00:00Z', size: 640 },
  ],
};

// Generate default config files for repositories that don't have specific ones
for (const repo of mockRepositories) {
  if (!mockConfigFiles[repo.id]) {
    mockConfigFiles[repo.id] = [
      { id: `${repo.id}-f1`, name: 'application.json', path: 'src/main/resources/application.json', lastModified: repo.lastUpdated, size: 2048 },
      { id: `${repo.id}-f2`, name: 'report-config.json', path: 'src/main/resources/report-config.json', lastModified: repo.lastUpdated, size: 3072 },
      { id: `${repo.id}-f3`, name: 'config.json', path: 'config/config.json', lastModified: repo.lastUpdated, size: 1024 },
    ];
  }
}

export const mockJsonContents: Record<string, string> = {
  'f1': JSON.stringify({
    reportId: 523,
    groupId: "group-17",
    enabled: true,
    timeout: 30,
    retryCount: 3,
    maxConcurrent: 5,
    outputFormat: "PDF",
    compression: true,
    logLevel: "INFO",
    endpoints: {
      primary: "https://api.reports.internal/v2",
      fallback: "https://api-backup.reports.internal/v2"
    }
  }, null, 2),
  'f2': JSON.stringify({
    reportName: "Group 1 Monthly Report",
    schedule: "0 0 1 * *",
    recipients: ["team-lead@company.com", "manager@company.com"],
    templateId: "TPL-001",
    dataSource: "warehouse-primary",
    filters: {
      dateRange: "last-30-days",
      departments: ["engineering", "product"],
      excludeInactive: true
    }
  }, null, 2),
  'f3': JSON.stringify({
    reportId: 523,
    groupId: "group-17",
    enabled: true,
    timeout: 30,
    retryCount: 3
  }, null, 2),
  'f4': JSON.stringify({
    version: "2.1.0",
    environment: "production",
    database: {
      host: "db-primary.internal",
      port: 5432,
      name: "reports_db",
      poolSize: 20
    },
    cache: {
      enabled: true,
      ttl: 3600,
      provider: "redis"
    }
  }, null, 2),
};

// Generate default content for files without specific content
const defaultJsonContent = JSON.stringify({
  reportId: 523,
  groupId: "group-17",
  enabled: true,
  timeout: 30,
  retryCount: 3
}, null, 2);

export function getJsonContent(fileId: string): string {
  return mockJsonContents[fileId] || defaultJsonContent;
}

export const mockMergeRequests: MergeRequest[] = [
  {
    id: 1001,
    iid: 2481,
    title: 'RM12140: Update report configuration',
    description: 'Updated groupId and timeout settings for Report Group 1',
    sourceBranch: 'json-update/RM12140-20260914-0830',
    targetBranch: 'master',
    repository: 'Report-Group-1-Microservices',
    repositoryId: 'repo-1',
    file: 'config/config.json',
    author: 'Sumit Kumar',
    createdAt: '2026-09-14T08:30:00Z',
    status: 'opened',
    commitId: 'a81f92c',
  },
  {
    id: 1002,
    iid: 2480,
    title: 'RM12139: Enable compression for Group 10',
    description: 'Enabled compression and increased timeout for Group 10 reports',
    sourceBranch: 'json-update/RM12139-20260913-1420',
    targetBranch: 'master',
    repository: 'Report-Group-10-Microservices',
    repositoryId: 'repo-10',
    file: 'src/main/resources/application.json',
    author: 'Sumit Kumar',
    createdAt: '2026-09-13T14:20:00Z',
    status: 'merged',
    commitId: 'b72e41d',
  },
  {
    id: 1003,
    iid: 2479,
    title: 'Update dynamic report schedule',
    description: 'Changed cron schedule for dynamic report generation',
    sourceBranch: 'json-update/config-20260912-1645',
    targetBranch: 'master',
    repository: 'DynamicReportMicroservices',
    repositoryId: 'repo-dynamic',
    file: 'config/config.json',
    author: 'Ravi Patel',
    createdAt: '2026-09-12T16:45:00Z',
    status: 'merged',
    commitId: 'c93d12e',
  },
  {
    id: 1004,
    iid: 2478,
    title: 'RM12138: Fix retry configuration',
    description: 'Corrected retry count and timeout for process reports',
    sourceBranch: 'json-update/RM12138-20260911-0930',
    targetBranch: 'master',
    repository: 'ProcessReportMicroservices',
    repositoryId: 'repo-process',
    file: 'src/main/resources/report-config.json',
    author: 'Sumit Kumar',
    createdAt: '2026-09-11T09:30:00Z',
    status: 'closed',
    commitId: 'd04f23a',
  },
  {
    id: 1005,
    iid: 2477,
    title: 'RM12137: Update Group 2 endpoints',
    description: 'Updated API endpoints for Group 2 report services',
    sourceBranch: 'json-update/RM12137-20260910-1145',
    targetBranch: 'master',
    repository: 'Report-Group-2-Microservices',
    repositoryId: 'repo-2',
    file: 'src/main/resources/application.json',
    author: 'Anita Sharma',
    createdAt: '2026-09-10T11:45:00Z',
    status: 'merged',
    commitId: 'e15g34b',
  },
];

export const mockUpdateHistory: UpdateRecord[] = [
  {
    id: 'upd-1',
    date: '2026-09-14T08:30:00Z',
    repository: 'Report-Group-1-Microservices',
    repositoryId: 'repo-1',
    file: 'config/config.json',
    branch: 'json-update/RM12140-20260914-0830',
    commitId: 'a81f92c',
    mergeRequestIid: 2481,
    user: 'Sumit Kumar',
    status: 'opened',
  },
  {
    id: 'upd-2',
    date: '2026-09-13T14:20:00Z',
    repository: 'Report-Group-10-Microservices',
    repositoryId: 'repo-10',
    file: 'src/main/resources/application.json',
    branch: 'json-update/RM12139-20260913-1420',
    commitId: 'b72e41d',
    mergeRequestIid: 2480,
    user: 'Sumit Kumar',
    status: 'merged',
  },
  {
    id: 'upd-3',
    date: '2026-09-12T16:45:00Z',
    repository: 'DynamicReportMicroservices',
    repositoryId: 'repo-dynamic',
    file: 'config/config.json',
    branch: 'json-update/config-20260912-1645',
    commitId: 'c93d12e',
    mergeRequestIid: 2479,
    user: 'Ravi Patel',
    status: 'merged',
  },
  {
    id: 'upd-4',
    date: '2026-09-11T09:30:00Z',
    repository: 'ProcessReportMicroservices',
    repositoryId: 'repo-process',
    file: 'src/main/resources/report-config.json',
    branch: 'json-update/RM12138-20260911-0930',
    commitId: 'd04f23a',
    mergeRequestIid: 2478,
    user: 'Sumit Kumar',
    status: 'closed',
  },
  {
    id: 'upd-5',
    date: '2026-09-10T11:45:00Z',
    repository: 'Report-Group-2-Microservices',
    repositoryId: 'repo-2',
    file: 'src/main/resources/application.json',
    branch: 'json-update/RM12137-20260910-1145',
    commitId: 'e15g34b',
    mergeRequestIid: 2477,
    user: 'Anita Sharma',
    status: 'merged',
  },
  {
    id: 'upd-6',
    date: '2026-09-09T15:30:00Z',
    repository: 'Report-Group-13-Microservices',
    repositoryId: 'repo-13',
    file: 'config/config.json',
    branch: 'json-update/RM12136-20260909-1530',
    commitId: 'f26h45c',
    mergeRequestIid: 2476,
    user: 'Sumit Kumar',
    status: 'merged',
  },
];

export const mockSettings: AppSettings = {
  gitlabUrl: 'https://gitlab.company.com',
  defaultBranch: 'master',
  branchPattern: 'json-update/{ticketId}-{timestamp}',
  commitPattern: '{ticketId}: {description}',
  jsonValidation: {
    strictMode: true,
    maxDepth: 10,
    maxSize: 102400,
  },
};
