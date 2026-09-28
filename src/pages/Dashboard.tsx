import { useState, useEffect, type FormEvent, useMemo, useRef } from 'react';
import { DiffEditor, type BeforeMount, type DiffOnMount } from '@monaco-editor/react';
import {
  Search,
  GitBranch,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  FileJson,
  Play,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Database,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight,
  GitMerge,
  Send,
  GitCommit,
  UploadCloud,
  FileCode,
  Lock,
  Unlock,
  ExternalLink,
  GitPullRequest,
} from 'lucide-react';
import { gitlabApi } from '../api/gitlabApi';
import { useToast } from '../hooks/useToast';
import { useEnvironment } from '../hooks/useEnvironment';
import { EnvironmentSelector } from '../components/EnvironmentSelector';
import type { GitLabSearchFile, GitLabCreateMergeRequestResponse } from '../types';

export function DashboardPage() {
  const { addToast } = useToast();
  const { baseUrl, environment, envInfo } = useEnvironment();
  const diffEditorRef = useRef<any>(null);

  // Screen 1: Search Report State (GitLab)
  const [branch, setBranch] = useState<'qa' | 'master'>('qa');
  const [reportInput, setReportInput] = useState('10174');
  const [results, setResults] = useState<GitLabSearchFile[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<GitLabSearchFile | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Screen 1: GitLab File Content
  const [gitlabJson, setGitlabJson] = useState<string>('');
  const [isLoadingGitlabFile, setIsLoadingGitlabFile] = useState(false);
  const [copiedGitlabJson, setCopiedGitlabJson] = useState(false);

  // Screen 2: Generate Report State (Database)
  const [genReportId, setGenReportId] = useState('10174');
  const [genMode, setGenMode] = useState<'auto' | 'dynamic' | 'hycile'>('auto');
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [isLoadingGen, setIsLoadingGen] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedGenJson, setCopiedGenJson] = useState(false);

  // Create Branch State
  const [createBaseBranch, setCreateBaseBranch] = useState<'qa' | 'master'>('qa');
  const [rmNumber, setRmNumber] = useState('12150');
  const [branchSuffix, setBranchSuffix] = useState('json-update-ai');
  const [customBranchName, setCustomBranchName] = useState('RM12150-json-update-ai');
  const [isCustomBranchEdited, setIsCustomBranchEdited] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [createdBranchResult, setCreatedBranchResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const [showRmExplanation, setShowRmExplanation] = useState(false);

  // Update File State
  const [updateBranch, setUpdateBranch] = useState('');
  const [updateFilePath, setUpdateFilePath] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitMsgEdited, setIsCommitMsgEdited] = useState(false);
  const [isUpdatingFile, setIsUpdatingFile] = useState(false);
  const [updateFileResult, setUpdateFileResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

  // Merge Request State
  const [mrSourceBranch, setMrSourceBranch] = useState('');
  const [mrTargetBranch, setMrTargetBranch] = useState<'qa' | 'master' | string>('qa');
  const [mrTitle, setMrTitle] = useState('RM12150 - Update report JSON');
  const [mrDescription, setMrDescription] = useState('Updated report configuration through Report JSON Update Tool');
  const [isMrTitleEdited, setIsMrTitleEdited] = useState(false);
  const [isCreatingMr, setIsCreatingMr] = useState(false);
  const [createdMrResult, setCreatedMrResult] = useState<{ success: boolean; data?: GitLabCreateMergeRequestResponse; error?: string } | null>(null);

  // Determine report type based on digits
  const cleanGenId = genReportId.trim().replace(/^report_/, '').replace(/\.json$/, '');
  const isHycile =
    genMode === 'hycile' ? true : genMode === 'dynamic' ? false : cleanGenId.length >= 5;
  const detectedTypeLabel = isHycile ? 'Hycile (5-digit)' : 'Dynamic (3-digit)';

  // Helper to format clean RM string (e.g. 12150 -> RM12150, RM12150 -> RM12150)
  const formattedRm = useMemo(() => {
    const raw = rmNumber.trim();
    if (!raw) return '';
    return raw.toUpperCase().startsWith('RM') ? raw.toUpperCase() : `RM${raw}`;
  }, [rmNumber]);

  // Update constructed branch name when RM or suffix changes if user hasn't typed a full manual override
  useEffect(() => {
    if (!isCustomBranchEdited) {
      const rmPart = formattedRm || 'RM12150';
      const suffixPart = branchSuffix.trim() || 'json-update-ai';
      const newName = `${rmPart}-${suffixPart}`;
      setCustomBranchName(newName);
      if (!updateBranch || updateBranch === customBranchName) {
        setUpdateBranch(newName);
      }
      if (!mrSourceBranch || mrSourceBranch === customBranchName) {
        setMrSourceBranch(newName);
      }
    }
  }, [formattedRm, branchSuffix, isCustomBranchEdited]);

  // Sync update branch & MR source branch whenever branch is successfully created
  useEffect(() => {
    if (createdBranchResult?.data?.branch) {
      setUpdateBranch(createdBranchResult.data.branch);
      setMrSourceBranch(createdBranchResult.data.branch);
    }
  }, [createdBranchResult]);

  // Sync MR target branch with base branch
  useEffect(() => {
    setMrTargetBranch(createBaseBranch);
  }, [createBaseBranch]);

  // Sync MR title whenever RM number changes
  useEffect(() => {
    if (!isMrTitleEdited) {
      const rm = formattedRm || 'RM12150';
      setMrTitle(`${rm} - Update report JSON`);
    }
  }, [formattedRm, isMrTitleEdited]);

  // Sync update file path whenever search selected file changes
  useEffect(() => {
    if (selectedFile?.path) {
      setUpdateFilePath(selectedFile.path);
    }
  }, [selectedFile]);

  // Automated commit message generator
  useEffect(() => {
    if (!isCommitMsgEdited) {
      const id = cleanGenId || reportInput || '10174';
      setCommitMessage(`Update report ${id} JSON`);
    }
  }, [cleanGenId, reportInput, isCommitMsgEdited]);

  // Sync base branch with search branch by default
  useEffect(() => {
    setCreateBaseBranch(branch);
  }, [branch]);

  // Search Files on GitLab
  const executeSearch = async (targetBranch: 'qa' | 'master' = branch, searchParam: string = reportInput) => {
    const rawVal = searchParam.trim();
    if (!rawVal) {
      setSearchError('Enter report ID (e.g. 10174)');
      return;
    }

    setIsLoadingSearch(true);
    setSearchError(null);

    try {
      const data = await gitlabApi.searchReportFiles(targetBranch, rawVal);
      setResults(data);
      if (data.length > 0) {
        const file = data[0];
        setSelectedFile(file);
        const extractedId = file.name.replace(/^report_/, '').replace(/\.json$/, '');
        if (extractedId) {
          setGenReportId(extractedId);
        }
        // Auto fetch the file content from GitLab
        fetchGitlabFile(targetBranch, file.path);
      } else {
        setSelectedFile(null);
        setGitlabJson('');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'API connection failed';
      setSearchError(`${errorMsg} (${baseUrl})`);
      setResults(null);
      setSelectedFile(null);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Fetch GitLab File Content (Single File API)
  const fetchGitlabFile = async (branchToUse: string, filePath: string) => {
    setIsLoadingGitlabFile(true);

    try {
      const data = await gitlabApi.getGitlabFileContent(branchToUse, filePath);
      const contentData = data.content !== undefined ? data.content : data;
      const formatted =
        typeof contentData === 'string'
          ? contentData.startsWith('{') || contentData.startsWith('[')
            ? JSON.stringify(JSON.parse(contentData), null, 2)
            : contentData
          : JSON.stringify(contentData, null, 2);

      setGitlabJson(formatted);
      addToast('success', 'GitLab file loaded');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch GitLab file';
      setSearchError(`${errorMsg} (${baseUrl})`);
      setGitlabJson('');
    } finally {
      setIsLoadingGitlabFile(false);
    }
  };

  // Generate Report Config from Database
  const executeGenerate = async (idToGen: string = genReportId, modeToUse = genMode) => {
    const targetId = idToGen.trim().replace(/^report_/, '').replace(/\.json$/, '');
    if (!targetId) {
      setGenError('Please enter a Report ID');
      return;
    }

    setIsLoadingGen(true);
    setGenError(null);

    try {
      const data = await gitlabApi.generateReportConfig(targetId, modeToUse);
      const formatted = JSON.stringify(data, null, 2);
      setGeneratedJson(formatted);
      addToast('success', `Database report config generated for ${targetId}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate report JSON';
      setGenError(`${errorMsg} — verify service on ${baseUrl}`);
      setGeneratedJson('');
    } finally {
      setIsLoadingGen(false);
    }
  };

  // Real-time Difference detection
  const diffSummary = useMemo(() => {
    if (!gitlabJson || !generatedJson) {
      return { status: 'idle', message: 'Load both JSONs to see difference highlighting' };
    }

    try {
      const parsed1 = JSON.parse(gitlabJson);
      const parsed2 = JSON.parse(generatedJson);
      const clean1 = JSON.stringify(parsed1);
      const clean2 = JSON.stringify(parsed2);

      if (clean1 === clean2) {
        return { status: 'identical', message: 'No Change — Both JSONs Match' };
      } else {
        return {
          status: 'different',
          message: 'Differences Detected: Missing in Red (Left) vs Extra in Green (Right)',
        };
      }
    } catch {
      if (gitlabJson.trim() === generatedJson.trim()) {
        return { status: 'identical', message: 'No Change — Both JSONs Match' };
      }
      return { status: 'different', message: 'Differences Detected in JSON' };
    }
  }, [gitlabJson, generatedJson]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('custom-diff-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'diffEditor.insertedTextBackground': '#22c55e35',
        'diffEditor.insertedLineBackground': '#22c55e20',
        'diffEditor.removedTextBackground': '#ef444445',
        'diffEditor.removedLineBackground': '#ef444425',
        'diffEditorGutter.insertedLineGutterBackground': '#22c55e50',
        'diffEditorGutter.removedLineGutterBackground': '#ef444450',
        'diffEditor.diagonalFill': '#1e223540',
      },
    });
  };

  const handleDiffMount: DiffOnMount = (editor) => {
    diffEditorRef.current = editor;
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeSearch(branch, reportInput);
  };

  const handleGenerateSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeGenerate(genReportId, genMode);
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    addToast('info', 'Path copied');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleCopyGitlabJson = () => {
    if (!gitlabJson) return;
    navigator.clipboard.writeText(gitlabJson);
    setCopiedGitlabJson(true);
    addToast('info', 'GitLab JSON copied');
    setTimeout(() => setCopiedGitlabJson(false), 2000);
  };

  const handleCopyGenJson = () => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson);
    setCopiedGenJson(true);
    addToast('info', 'Database JSON copied');
    setTimeout(() => setCopiedGenJson(false), 2000);
  };

  const handleDownloadGitlabJson = () => {
    if (!gitlabJson) return;
    const blob = new Blob([gitlabJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile?.name || 'gitlab_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGenJson = () => {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${cleanGenId || 'db'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Branch Creation Handler
  const handleCreateBranch = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const finalBranchName = customBranchName.trim();
    if (!finalBranchName) {
      addToast('error', 'Please provide a valid branch name with RM number');
      return;
    }

    if (!finalBranchName.toUpperCase().includes('RM')) {
      addToast('info', 'Branch name should contain an RM number (e.g. RM12150-json-update-ai)');
    }

    setIsCreatingBranch(true);
    setCreatedBranchResult(null);

    const payload = {
      baseBranch: createBaseBranch,
      newBranch: finalBranchName,
    };

    try {
      const res = await gitlabApi.createBranch(payload);
      setCreatedBranchResult({ success: true, data: res });
      addToast('success', res.message || `Branch "${res.branch || finalBranchName}" created successfully!`);
      // Auto switch target branch for step 2 file update
      if (res.branch) {
        setUpdateBranch(res.branch);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create branch on GitLab';
      setCreatedBranchResult({ success: false, error: errorMsg });
      addToast('error', `Failed to create branch: ${errorMsg}`);
    } finally {
      setIsCreatingBranch(false);
    }
  };

  // Update GitLab File Content Handler (PUT /api/gitlab/file)
  const handleUpdateFile = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const targetBranch = updateBranch.trim() || customBranchName.trim();
    if (!targetBranch) {
      addToast('error', 'Please enter or select a branch name');
      return;
    }

    const targetPath = updateFilePath.trim() || selectedFile?.path?.trim();
    if (!targetPath) {
      addToast('error', 'File path is required. Search a report to get the path.');
      return;
    }

    if (!generatedJson) {
      addToast('error', 'Database JSON content is empty. Click Generate first.');
      return;
    }

    const finalCommitMsg = commitMessage.trim() || `Update report ${cleanGenId || reportInput || 'config'} JSON`;

    setIsUpdatingFile(true);
    setUpdateFileResult(null);

    const payload = {
      branch: targetBranch,
      filePath: targetPath,
      content: generatedJson,
      commitMessage: finalCommitMsg,
    };

    try {
      const res = await gitlabApi.updateGitlabFile(payload);
      setUpdateFileResult({ success: true, data: res });
      addToast('success', res.message || `Successfully committed and updated ${targetPath} on "${targetBranch}"!`);
      // Auto prefill MR source branch
      setMrSourceBranch(targetBranch);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update file on GitLab';
      setUpdateFileResult({ success: false, error: errorMsg });
      addToast('error', `Update file failed: ${errorMsg}`);
    } finally {
      setIsUpdatingFile(false);
    }
  };

  // Create GitLab Merge Request Handler (POST /api/gitlab/merge-requests)
  const handleCreateMergeRequest = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const source = mrSourceBranch.trim() || updateBranch.trim() || customBranchName.trim();
    if (!source) {
      addToast('error', 'Source branch is required to create a Merge Request');
      return;
    }

    const target = mrTargetBranch.trim() || createBaseBranch || 'qa';
    if (!target) {
      addToast('error', 'Target branch is required');
      return;
    }

    const title = mrTitle.trim() || `${formattedRm || 'RM12150'} - Update report JSON`;
    const description = mrDescription.trim() || 'Updated report configuration through Report JSON Update Tool';

    setIsCreatingMr(true);
    setCreatedMrResult(null);

    const payload = {
      sourceBranch: source,
      targetBranch: target,
      title,
      description,
    };

    try {
      const res = await gitlabApi.createMergeRequest(payload);
      setCreatedMrResult({ success: true, data: res });
      addToast('success', `Merge Request !${res.mergeRequestId} created successfully!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create merge request on GitLab';
      setCreatedMrResult({ success: false, error: errorMsg });
      addToast('error', `Create MR failed: ${errorMsg}`);
    } finally {
      setIsCreatingMr(false);
    }
  };

  // Example branch templates for 1-click select
  const currentCleanRm = formattedRm || 'RM12150';
  const exampleBranches = [
    { label: `${currentCleanRm}-json-update-ai`, desc: 'Standard update with AI suffix' },
    { label: `${currentCleanRm}-report-${cleanGenId || reportInput || '10174'}`, desc: 'Report ID specific' },
    { label: `${currentCleanRm}-config-sync`, desc: 'Config synchronization' },
    { label: `${currentCleanRm}-update-fields`, desc: 'Field updates' },
  ];

  // Queries on mount and when environment changes
  useEffect(() => {
    executeSearch(branch, reportInput);
    executeGenerate(genReportId || '10174', genMode || 'auto');
  }, [environment]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        background: 'var(--color-bg-primary)',
        fontSize: 12,
        overflowY: 'auto',
      }}
    >
      {/* Top Diff Status Comparison Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border-default)',
          minHeight: 38,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Comparison:
          </span>

          {diffSummary.status === 'identical' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 10px',
                borderRadius: 12,
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} />
              <span>No Change — Both JSONs Match</span>
            </span>
          )}

          {diffSummary.status === 'different' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={13} />
                <span>Differences Detected</span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />
                Missing (Red)
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(34, 197, 94, 0.12)',
                  color: '#4ade80',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#22c55e' }} />
                Extra (Green)
              </span>
            </div>
          )}

          {diffSummary.status === 'idle' && (
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              {diffSummary.message}
            </span>
          )}
        </div>

        {/* Sync Action & Environment Radio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EnvironmentSelector variant="radio" />

          <button
            type="button"
            onClick={() => {
              if (selectedFile) {
                fetchGitlabFile(branch, selectedFile.path);
              } else {
                executeSearch(branch, reportInput);
              }
              executeGenerate(genReportId, genMode);
            }}
            className="btn-ghost"
            style={{ fontSize: 11, padding: '4px 10px', height: 28, gap: 5, borderRadius: 'var(--radius-sm)' }}
            title={`Reload both from active environment (${baseUrl})`}
          >
            <RefreshCw size={12} className={isLoadingSearch || isLoadingGitlabFile || isLoadingGen ? 'animate-spin' : ''} />
            <span>Reload APIs</span>
          </button>
        </div>
      </div>

      {/* Top 50/50 Control Panels */}
      <div style={{ display: 'flex', width: '100%', background: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border-default)', flexShrink: 0 }}>
        {/* Left Control Bar: Search Report */}
        <div
          style={{
            flex: 1,
            width: '50%',
            padding: '10px 14px',
            borderRight: '1px solid var(--color-border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileJson size={13} color="var(--color-accent-primary)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                1. GitLab File (Read-Only)
              </span>
            </div>

            {/* Mini Branch Selector */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--color-bg-secondary)',
                padding: 2,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              {(['qa', 'master'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setBranch(b);
                    executeSearch(b, reportInput);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '2px 8px',
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: branch === b ? 'var(--color-accent-primary)' : 'transparent',
                    color: branch === b ? 'white' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <GitBranch size={10} />
                  <span>{b}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Row */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={13} />
              </div>
              <input
                type="text"
                value={reportInput}
                onChange={(e) => setReportInput(e.target.value)}
                placeholder="Enter report ID (e.g. 10174)"
                style={{
                  width: '100%',
                  height: 28,
                  padding: '0 8px 0 26px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingSearch}
              style={{
                height: 28,
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--color-accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                fontWeight: 600,
                cursor: isLoadingSearch ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              {isLoadingSearch ? <RefreshCw size={11} className="animate-spin" /> : <Search size={11} />}
              <span>Search</span>
            </button>
          </form>

          {/* Search Result Item with View File Action */}
          {results && results.length > 0 && selectedFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedFile.name}</span>
                <span
                  style={{
                    color: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 10,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedFile.path}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => fetchGitlabFile(branch, selectedFile.path)}
                  className="btn-ghost"
                  style={{
                    padding: '2px 6px',
                    fontSize: 10,
                    height: 22,
                    color: 'var(--color-accent-primary)',
                    background: 'var(--color-accent-muted)',
                  }}
                  title="Reload GitLab file"
                >
                  <Eye size={11} />
                  <span>View File</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyPath(selectedFile.path)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: 2 }}
                  title="Copy path"
                >
                  {copiedPath === selectedFile.path ? <Check size={11} color="var(--color-success)" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          )}

          {searchError && (
            <div style={{ color: '#f87171', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={11} />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Right Control Bar: Generate from Database */}
        <div
          style={{
            flex: 1,
            width: '50%',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={13} color="#a855f7" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                2. Generate Report JSON from Database
              </span>
            </div>

            <span
              style={{
                padding: '2px 6px',
                borderRadius: 4,
                background: isHycile ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: isHycile ? '#c084fc' : '#60a5fa',
                fontSize: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Zap size={9} />
              {detectedTypeLabel}
            </span>
          </div>

          {/* Generator Input Row */}
          <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', gap: 6 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={genReportId}
                onChange={(e) => setGenReportId(e.target.value)}
                placeholder="Report ID (e.g. 523 or 10419)"
                style={{
                  width: '100%',
                  height: 28,
                  padding: '0 8px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            {/* Quick Preset Chips */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => {
                  setGenReportId('523');
                  executeGenerate('523', 'dynamic');
                }}
                style={{
                  padding: '2px 6px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 10,
                  cursor: 'pointer',
                  height: 28,
                }}
                title="Dynamic (3 digits)"
              >
                523
              </button>
              <button
                type="button"
                onClick={() => {
                  setGenReportId('10419');
                  executeGenerate('10419', 'hycile');
                }}
                style={{
                  padding: '2px 6px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 10,
                  cursor: 'pointer',
                  height: 28,
                }}
                title="Hycile (5 digits)"
              >
                10419
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoadingGen}
              style={{
                height: 28,
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                fontWeight: 600,
                cursor: isLoadingGen ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              {isLoadingGen ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
              <span>Generate</span>
            </button>
          </form>

          {genError && (
            <div style={{ color: '#f87171', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={11} />
              <span>{genError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor Toolbars & Actions Header */}
      <div style={{ display: 'flex', width: '100%', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border-default)', padding: '4px 14px', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10, borderRight: '1px solid var(--color-border-default)' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>GitLab JSON</span>
            {selectedFile && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 10 }}>({selectedFile.name})</span>}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" onClick={handleCopyGitlabJson} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, height: 20 }}>
              {copiedGitlabJson ? <Check size={10} color="var(--color-success)" /> : <Copy size={10} />}
              <span>Copy</span>
            </button>
            <button type="button" onClick={handleDownloadGitlabJson} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, height: 20 }}>
              <Download size={10} />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Database JSON</span>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 10 }}>({cleanGenId})</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" onClick={handleCopyGenJson} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, height: 20 }}>
              {copiedGenJson ? <Check size={10} color="var(--color-success)" /> : <Copy size={10} />}
              <span>Copy</span>
            </button>
            <button type="button" onClick={handleDownloadGenJson} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, height: 20 }}>
              <Download size={10} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Monaco Diff Editor — Fixed Height Size (480px) */}
      <div
        style={{
          width: '100%',
          height: 480,
          minHeight: 480,
          maxHeight: 480,
          background: '#1e1e1e',
          borderBottom: '1px solid var(--color-border-default)',
          flexShrink: 0,
        }}
      >
        <DiffEditor
          height="480px"
          language="json"
          original={gitlabJson || '{\n  "//": "GitLab JSON not loaded. Search and click View File."\n}'}
          modified={generatedJson || '{\n  "//": "Database JSON not generated. Click Generate."\n}'}
          theme="custom-diff-theme"
          beforeMount={handleBeforeMount}
          onMount={handleDiffMount}
          options={{
            renderSideBySide: true,
            originalEditable: false,
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            automaticLayout: true,
            lineNumbers: 'on',
            renderIndicators: true,
            diffWordWrap: 'off',
            ignoreTrimWhitespace: false,
            padding: { top: 8 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* Down Side: Workflow Actions */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--color-bg-primary)',
          borderTop: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* ========================================================================= */}
        {/* STEP 1: CREATE BRANCH (Enabled ONLY when differences exist between JSONs) */}
        {/* ========================================================================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '14px 16px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-md)',
                  background: diffSummary.status === 'different'
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))'
                    : 'rgba(148, 163, 184, 0.1)',
                  border: diffSummary.status === 'different'
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid var(--color-border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: diffSummary.status === 'different' ? '#818cf8' : 'var(--color-text-tertiary)',
                }}
              >
                <GitBranch size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    Step 1: Create GitLab Branch
                  </h3>
                  {diffSummary.status === 'different' ? (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Differences Found
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(148, 163, 184, 0.15)',
                        color: 'var(--color-text-tertiary)',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Locked (No Diff)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                  Create a new branch with RM ticket number for config synchronization
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRmExplanation(!showRmExplanation)}
              className="btn-ghost"
              style={{ fontSize: 11, gap: 5, padding: '4px 8px', color: 'var(--color-accent-primary)' }}
            >
              <HelpCircle size={13} />
              <span>What is RM Number?</span>
            </button>
          </div>

          {/* RM Explanation Card */}
          {showRmExplanation && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#818cf8', fontWeight: 600, fontSize: 11 }}>
                <Sparkles size={13} />
                <span>About RM (Release Management / Ticket Number)</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                <strong>RM</strong> stands for Release Management ticket (e.g. <strong>RM12150</strong>). It is required in your branch naming convention so your changes are automatically tracked in release pipelines and merge requests.
              </p>
            </div>
          )}

          {/* Condition: Differences must exist between both JSON files */}
          {diffSummary.status !== 'different' ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: diffSummary.status === 'identical' ? 'rgba(34, 197, 94, 0.08)' : 'var(--color-bg-primary)',
                border: diffSummary.status === 'identical' ? '1px solid rgba(34, 197, 94, 0.25)' : '1px dashed var(--color-border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {diffSummary.status === 'identical' ? (
                <>
                  <CheckCircle2 size={16} color="#4ade80" />
                  <div style={{ fontSize: 11 }}>
                    <span style={{ color: '#4ade80', fontWeight: 600 }}>No Differences Detected in JSONs</span>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                      Both GitLab and Database JSON files match. Branch creation is only enabled when differences are detected.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={16} color="#60a5fa" />
                  <div style={{ fontSize: 11 }}>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>Comparison Incomplete</span>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                      Please search & load a GitLab file and generate a Database JSON to compare differences before creating a branch.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Branch Creation Form (Active) */}
              <form
                onSubmit={handleCreateBranch}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 220px) minmax(180px, 240px) 1fr auto',
                  gap: 12,
                  alignItems: 'flex-end',
                }}
              >
                {/* Base Branch Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Base Branch (Source)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      background: 'var(--color-bg-primary)',
                      padding: 3,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-default)',
                      height: 32,
                    }}
                  >
                    {(['qa', 'master'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setCreateBaseBranch(b)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: createBaseBranch === b ? 'var(--color-accent-primary)' : 'transparent',
                          color: createBaseBranch === b ? 'white' : 'var(--color-text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <GitBranch size={11} />
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RM Number Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    RM Number (Release Ticket)
                  </label>
                  <input
                    type="text"
                    value={rmNumber}
                    onChange={(e) => {
                      setRmNumber(e.target.value);
                      setIsCustomBranchEdited(false);
                    }}
                    placeholder="e.g. 12150 or RM12150"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* New Branch Name Preview / Editable */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    New Branch Name
                  </label>
                  <input
                    type="text"
                    value={customBranchName}
                    onChange={(e) => {
                      setCustomBranchName(e.target.value);
                      setIsCustomBranchEdited(true);
                    }}
                    placeholder="RM12150-json-update-ai"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#60a5fa',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Create Branch Button */}
                <button
                  type="submit"
                  disabled={isCreatingBranch || !customBranchName.trim()}
                  style={{
                    height: 32,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isCreatingBranch ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  {isCreatingBranch ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Create Branch</span>
                </button>
              </form>

              {/* Examples of Branch Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  Quick Examples:
                </span>
                {exampleBranches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setCustomBranchName(item.label);
                      setIsCustomBranchEdited(true);
                    }}
                    style={{
                      padding: '3px 8px',
                      background: customBranchName === item.label ? 'rgba(99, 102, 241, 0.2)' : 'var(--color-bg-primary)',
                      border: customBranchName === item.label ? '1px solid #6366f1' : '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: customBranchName === item.label ? '#818cf8' : 'var(--color-text-secondary)',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono, monospace)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title={item.desc}
                  >
                    <GitMerge size={10} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* API Payload Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Endpoint:</span>
                  <span>POST /api/gitlab/branches</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Payload:</span>
                  <span style={{ color: '#60a5fa' }}>
                    {`{ "baseBranch": "${createBaseBranch}", "newBranch": "${customBranchName}" }`}
                  </span>
                </div>
              </div>

              {/* Created Branch Status Feedback */}
              {createdBranchResult && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: createdBranchResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: createdBranchResult.success ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {createdBranchResult.success ? (
                      <CheckCircle2 size={16} color="#4ade80" />
                    ) : (
                      <AlertCircle size={16} color="#f87171" />
                    )}
                    <div style={{ fontSize: 11 }}>
                      {createdBranchResult.success ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ color: '#4ade80', fontWeight: 600 }}>
                            {createdBranchResult.data?.message || 'Branch created successfully! Step 2 is now unlocked.'}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>
                            Branch: <strong style={{ color: '#60a5fa' }}>{createdBranchResult.data?.branch || customBranchName}</strong> (from base: <strong style={{ color: 'var(--color-text-primary)' }}>{createdBranchResult.data?.baseBranch || createBaseBranch}</strong>)
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#f87171', fontWeight: 600 }}>
                          Error: {createdBranchResult.error}
                        </span>
                      )}
                    </div>
                  </div>

                  {createdBranchResult.success && (
                    <button
                      type="button"
                      onClick={() => {
                        const br = createdBranchResult.data?.branch || customBranchName;
                        navigator.clipboard.writeText(br);
                        addToast('info', `Copied "${br}" to clipboard`);
                      }}
                      className="btn-ghost"
                      style={{ fontSize: 10, padding: '2px 8px', height: 24, gap: 4 }}
                    >
                      <Copy size={11} />
                      <span>Copy Branch Name</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP 2: COMMIT & UPDATE FILE (Enabled ONLY AFTER branch is created) */}
        {/* ========================================================================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '14px 16px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: createdBranchResult?.success
              ? '1px solid rgba(34, 197, 94, 0.4)'
              : '1px solid var(--color-border-default)',
            opacity: createdBranchResult?.success ? 1 : 0.7,
            transition: 'all 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-md)',
                  background: createdBranchResult?.success
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(59, 130, 246, 0.25))'
                    : 'rgba(148, 163, 184, 0.1)',
                  border: createdBranchResult?.success
                    ? '1px solid rgba(34, 197, 94, 0.4)'
                    : '1px solid var(--color-border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: createdBranchResult?.success ? '#4ade80' : 'var(--color-text-tertiary)',
                }}
              >
                {createdBranchResult?.success ? <Unlock size={16} /> : <Lock size={16} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    Step 2: Commit & Update File to Branch
                  </h3>
                  {createdBranchResult?.success ? (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Unlocked & Ready
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(148, 163, 184, 0.15)',
                        color: 'var(--color-text-tertiary)',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Locked (Create Branch First)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                  Push the original database JSON to the newly created branch
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: generatedJson ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: generatedJson ? '#4ade80' : '#f87171',
                  fontSize: 10,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <FileCode size={11} />
                <span>Content: {generatedJson ? `${generatedJson.length} chars (Original DB JSON)` : 'Not Loaded'}</span>
              </span>
            </div>
          </div>

          {/* Condition: Branch must be created first before updating file */}
          {!createdBranchResult?.success ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-primary)',
                border: '1px dashed var(--color-border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Lock size={16} color="var(--color-text-tertiary)" />
              <div style={{ fontSize: 11 }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>File Update Locked</span>
                <p style={{ color: 'var(--color-text-tertiary)', margin: '2px 0 0 0' }}>
                  Please create a branch above in Step 1 first. Once the branch is created on GitLab, this section will automatically unlock with the new branch preselected.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Update File Form (Active) */}
              <form
                onSubmit={handleUpdateFile}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 220px) 1fr 1.2fr auto',
                  gap: 12,
                  alignItems: 'flex-end',
                }}
              >
                {/* Target Branch */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Target Branch (Created)
                  </label>
                  <input
                    type="text"
                    value={updateBranch}
                    onChange={(e) => setUpdateBranch(e.target.value)}
                    placeholder="e.g. RM12150-json-update-ai"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#60a5fa',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* File Path */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    File Path (from search)
                  </label>
                  <input
                    type="text"
                    value={updateFilePath}
                    onChange={(e) => setUpdateFilePath(e.target.value)}
                    placeholder="Report-Group-.../report_10406.json"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-primary)',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono, monospace)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Commit Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Commit Message
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => {
                      setCommitMessage(e.target.value);
                      setIsCommitMsgEdited(true);
                    }}
                    placeholder="Update report 10406 JSON"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-primary)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Commit & Push Button */}
                <button
                  type="submit"
                  disabled={isUpdatingFile || !updateBranch.trim() || !updateFilePath.trim() || !generatedJson}
                  style={{
                    height: 32,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isUpdatingFile || !generatedJson ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {isUpdatingFile ? <RefreshCw size={13} className="animate-spin" /> : <GitCommit size={13} />}
                  <span>Commit & Update</span>
                </button>
              </form>

              {/* Quick Commit Message Suggestions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  Commit Templates:
                </span>
                {[
                  `Update report ${cleanGenId || reportInput || '10406'} JSON`,
                  `${formattedRm || 'RM12150'}: Sync report ${cleanGenId || reportInput} config from DB`,
                  `Update report config JSON with schema changes`,
                ].map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => {
                      setCommitMessage(msg);
                      setIsCommitMsgEdited(true);
                    }}
                    style={{
                      padding: '3px 8px',
                      background: commitMessage === msg ? 'rgba(59, 130, 246, 0.2)' : 'var(--color-bg-primary)',
                      border: commitMessage === msg ? '1px solid #3b82f6' : '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: commitMessage === msg ? '#60a5fa' : 'var(--color-text-secondary)',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <GitCommit size={10} />
                    <span>{msg}</span>
                  </button>
                ))}
              </div>

              {/* Update File API Payload Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Endpoint:</span>
                  <span>PUT /api/gitlab/file</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Branch:</span>
                  <span style={{ color: '#60a5fa' }}>{updateBranch || customBranchName}</span>
                  <span style={{ color: 'var(--color-text-secondary)', marginLeft: 8 }}>File:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{updateFilePath ? updateFilePath.split('/').pop() : 'none'}</span>
                </div>
              </div>

              {/* Update File Result Feedback */}
              {updateFileResult && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: updateFileResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: updateFileResult.success ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {updateFileResult.success ? (
                      <CheckCircle2 size={16} color="#4ade80" />
                    ) : (
                      <AlertCircle size={16} color="#f87171" />
                    )}
                    <div style={{ fontSize: 11 }}>
                      {updateFileResult.success ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ color: '#4ade80', fontWeight: 600 }}>
                            {updateFileResult.data?.message || 'File updated and committed successfully!'}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>
                            Branch: <strong style={{ color: '#60a5fa' }}>{updateBranch}</strong> | Path: <strong style={{ color: 'var(--color-text-primary)' }}>{updateFilePath}</strong>
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#f87171', fontWeight: 600 }}>
                          Error: {updateFileResult.error}
                        </span>
                      )}
                    </div>
                  </div>

                  {updateFileResult.success && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedFile) {
                            fetchGitlabFile(updateBranch, updateFilePath);
                          }
                        }}
                        className="btn-ghost"
                        style={{ fontSize: 10, padding: '2px 8px', height: 24, gap: 4 }}
                        title="Reload file from GitLab to see updated version"
                      >
                        <RefreshCw size={11} />
                        <span>View Updated File</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: CREATE MERGE REQUEST (Enabled AFTER File is Updated)              */}
        {/* ========================================================================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '14px 16px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: updateFileResult?.success
              ? '1px solid rgba(168, 85, 247, 0.4)'
              : '1px solid var(--color-border-default)',
            opacity: updateFileResult?.success ? 1 : 0.7,
            transition: 'all 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-md)',
                  background: updateFileResult?.success
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))'
                    : 'rgba(148, 163, 184, 0.1)',
                  border: updateFileResult?.success
                    ? '1px solid rgba(168, 85, 247, 0.4)'
                    : '1px solid var(--color-border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: updateFileResult?.success ? '#c084fc' : 'var(--color-text-tertiary)',
                }}
              >
                {updateFileResult?.success ? <GitPullRequest size={16} /> : <Lock size={16} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    Step 3: Create GitLab Merge Request
                  </h3>
                  {updateFileResult?.success ? (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Unlocked & Ready
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(148, 163, 184, 0.15)',
                        color: 'var(--color-text-tertiary)',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Locked (Update File First)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                  Open a GitLab merge request from the source branch into the target base branch
                </p>
              </div>
            </div>
          </div>

          {/* Condition: File must be committed/updated first in Step 2 */}
          {!updateFileResult?.success ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-primary)',
                border: '1px dashed var(--color-border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Lock size={16} color="var(--color-text-tertiary)" />
              <div style={{ fontSize: 11 }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Merge Request Creation Locked</span>
                <p style={{ color: 'var(--color-text-tertiary)', margin: '2px 0 0 0' }}>
                  Please commit and update the file to the branch in Step 2 above first. Once the file is pushed, this section will unlock automatically.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Merge Request Form (Active) */}
              <form
                onSubmit={handleCreateMergeRequest}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 220px) minmax(140px, 160px) 1.4fr 1.6fr auto',
                  gap: 12,
                  alignItems: 'flex-end',
                }}
              >
                {/* Source Branch */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Source Branch
                  </label>
                  <input
                    type="text"
                    value={mrSourceBranch}
                    onChange={(e) => setMrSourceBranch(e.target.value)}
                    placeholder="e.g. RM12150-json-update"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#60a5fa',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Target Branch */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Target Branch
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      background: 'var(--color-bg-primary)',
                      padding: 3,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-default)',
                      height: 32,
                    }}
                  >
                    {(['qa', 'master'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setMrTargetBranch(b)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: mrTargetBranch === b ? 'var(--color-accent-primary)' : 'transparent',
                          color: mrTargetBranch === b ? 'white' : 'var(--color-text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <GitBranch size={11} />
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* MR Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    MR Title
                  </label>
                  <input
                    type="text"
                    value={mrTitle}
                    onChange={(e) => {
                      setMrTitle(e.target.value);
                      setIsMrTitleEdited(true);
                    }}
                    placeholder="RM12150 - Update report JSON"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-primary)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* MR Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={mrDescription}
                    onChange={(e) => setMrDescription(e.target.value)}
                    placeholder="Updated report configuration through Report JSON Update Tool"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-primary)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Create MR Button */}
                <button
                  type="submit"
                  disabled={isCreatingMr || !mrSourceBranch.trim()}
                  style={{
                    height: 32,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isCreatingMr ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  {isCreatingMr ? <RefreshCw size={13} className="animate-spin" /> : <GitPullRequest size={13} />}
                  <span>Create MR</span>
                </button>
              </form>

              {/* Merge Request API Payload Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Endpoint:</span>
                  <span>POST /api/gitlab/merge-requests</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Route:</span>
                  <span style={{ color: '#60a5fa' }}>{mrSourceBranch}</span>
                  <span>→</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{mrTargetBranch}</span>
                </div>
              </div>

              {/* Created MR Status Feedback */}
              {createdMrResult && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: createdMrResult.success ? 'rgba(168, 85, 247, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                    border: createdMrResult.success ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {createdMrResult.success ? (
                      <CheckCircle2 size={18} color="#c084fc" />
                    ) : (
                      <AlertCircle size={18} color="#f87171" />
                    )}
                    <div style={{ fontSize: 11 }}>
                      {createdMrResult.success ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#c084fc', fontWeight: 700, fontSize: 12 }}>
                              Merge Request !{createdMrResult.data?.mergeRequestId} Created Successfully
                            </span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                              {createdMrResult.data?.title}
                            </span>
                          </div>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>
                            {createdMrResult.data?.sourceBranch} → {createdMrResult.data?.targetBranch}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#f87171', fontWeight: 600 }}>
                          Error: {createdMrResult.error}
                        </span>
                      )}
                    </div>
                  </div>

                  {createdMrResult.success && createdMrResult.data?.webUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (createdMrResult.data?.webUrl) {
                            navigator.clipboard.writeText(createdMrResult.data.webUrl);
                            addToast('info', 'MR URL copied to clipboard');
                          }
                        }}
                        className="btn-ghost"
                        style={{ fontSize: 10, padding: '4px 8px', height: 26, gap: 4 }}
                      >
                        <Copy size={11} />
                        <span>Copy Link</span>
                      </button>

                      <a
                        href={createdMrResult.data.webUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '4px 12px',
                          background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                          color: 'white',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 11,
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(168, 85, 247, 0.3)',
                        }}
                      >
                        <span>Open MR in GitLab</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



