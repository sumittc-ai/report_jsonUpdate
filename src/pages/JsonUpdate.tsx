import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, GitBranch } from 'lucide-react';
import { StepIndicator } from '../components/StepIndicator';
import { RepositorySelector } from '../components/RepositorySelector';
import { FileSelector } from '../components/FileSelector';
import { JsonEditor } from '../components/JsonEditor';
import { ChangeSummary } from '../components/ChangeSummary';
import { DiffViewer } from '../components/DiffViewer';
import { BranchPreview } from '../components/BranchPreview';
import { UpdateProgress } from '../components/UpdateProgress';
import { SuccessScreen } from '../components/SuccessScreen';
import { useToast } from '../hooks/useToast';
import { gitlabApi } from '../api/gitlabApi';
import { jsonService } from '../services/jsonService';
import type { Repository, ConfigFile, UpdateResult } from '../types';

type Step = 1 | 2 | 3 | 4 | 5;

export function JsonUpdatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Workflow state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Data state
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [configFiles, setConfigFiles] = useState<ConfigFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ConfigFile | null>(null);
  const [originalContent, setOriginalContent] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);

  // Loading states
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Branch / commit state
  const [branchName, setBranchName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [ticketId, setTicketId] = useState('');

  // Load repositories on mount
  useEffect(() => {
    gitlabApi.getRepositories().then((repos) => {
      setRepositories(repos);
      setLoadingRepos(false);
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (currentStep === 3) {
          const validation = jsonService.validate(currentContent);
          if (validation.valid && currentContent !== originalContent) {
            goToStep(4);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, currentContent, originalContent]);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
  }, []);

  const markCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  // Step 1: Select repository
  const handleRepoSelect = async (repo: Repository) => {
    setSelectedRepo(repo);
    markCompleted(1);
    setLoadingFiles(true);
    goToStep(2);

    const files = await gitlabApi.getConfigFiles(repo.id);
    setConfigFiles(files);
    setLoadingFiles(false);
    addToast('info', `Loaded ${files.length} configuration files`);
  };

  // Step 2: Select file
  const handleFileSelect = async (file: ConfigFile) => {
    setSelectedFile(file);
    markCompleted(2);
    setLoadingContent(true);
    goToStep(3);

    const content = await gitlabApi.getFileContent(selectedRepo!.id, file.id);
    setOriginalContent(content);
    setCurrentContent(content);
    setLoadingContent(false);
  };

  // Step 3 → 4: Review changes
  const handleReviewChanges = () => {
    const validation = jsonService.validate(currentContent);
    if (!validation.valid) {
      addToast('error', `Invalid JSON: ${validation.error}`);
      return;
    }
    if (currentContent === originalContent) {
      addToast('info', 'No changes to review');
      return;
    }
    markCompleted(3);
    goToStep(4);
  };

  // Step 4 → confirm: Branch creation
  const handleConfirmChanges = (branch: string, commit: string, ticket: string) => {
    setBranchName(branch);
    setCommitMessage(commit);
    setTicketId(ticket);
    markCompleted(4);
    setIsSubmitting(true);
  };

  // Progress complete → success
  const handleProgressComplete = async () => {
    try {
      const result = await gitlabApi.createUpdate({
        repositoryId: selectedRepo!.id,
        filePath: selectedFile!.path,
        content: currentContent,
        commitMessage,
        ticketId: ticketId || undefined,
      });
      setUpdateResult(result);
      markCompleted(5);
      setIsSubmitting(false);
      goToStep(5);
      addToast('success', 'Merge request created successfully!');
    } catch {
      setIsSubmitting(false);
      addToast('error', 'Failed to create update. Please try again.');
    }
  };

  // Reset
  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleContentChange = (value: string) => {
    setCurrentContent(value);
  };

  const handleEditorReset = () => {
    addToast('info', 'Editor reset to original content');
  };

  return (
    <div className="fade-in" style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
          JSON Update Workflow
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
          Safely update configuration files and create GitLab merge requests.
        </p>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          marginBottom: 28,
          padding: '16px',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <RepositorySelector
          repositories={repositories}
          selectedId={selectedRepo?.id || null}
          onSelect={handleRepoSelect}
          loading={loadingRepos}
        />
      )}

      {currentStep === 2 && (
        <div>
          {/* Back button */}
          <button
            className="btn-ghost"
            onClick={() => goToStep(1)}
            style={{ marginBottom: 12, gap: 6 }}
          >
            <ArrowLeft size={14} />
            Back to repositories
          </button>
          <FileSelector
            files={configFiles}
            selectedId={selectedFile?.id || null}
            onSelect={handleFileSelect}
            loading={loadingFiles}
            repositoryName={selectedRepo?.name}
          />
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <button
            className="btn-ghost"
            onClick={() => goToStep(2)}
            style={{ marginBottom: 12, gap: 6 }}
          >
            <ArrowLeft size={14} />
            Back to files
          </button>

          {loadingContent ? (
            <div className="card">
              <div className="skeleton" style={{ width: '100%', height: 400 }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
              <JsonEditor
                content={currentContent}
                originalContent={originalContent}
                onChange={handleContentChange}
                onReset={handleEditorReset}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ChangeSummary
                  originalContent={originalContent}
                  currentContent={currentContent}
                />
                <button
                  className="btn-primary"
                  onClick={handleReviewChanges}
                  disabled={currentContent === originalContent || !jsonService.validate(currentContent).valid}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                  title="Ctrl+Enter"
                >
                  <Eye size={14} />
                  Review Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 4 && !isSubmitting && (
        <div>
          <button
            className="btn-ghost"
            onClick={() => goToStep(3)}
            style={{ marginBottom: 12, gap: 6 }}
          >
            <ArrowLeft size={14} />
            Back to editor
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DiffViewer
              originalContent={originalContent}
              modifiedContent={currentContent}
              fileName={selectedFile?.name || ''}
              repositoryName={selectedRepo?.name || ''}
            />
            <BranchPreview
              repositoryName={selectedRepo?.name || ''}
              fileName={selectedFile?.name || ''}
              onConfirm={handleConfirmChanges}
              onBack={() => goToStep(3)}
            />
          </div>
        </div>
      )}

      {isSubmitting && (
        <UpdateProgress
          onComplete={handleProgressComplete}
          repositoryId={selectedRepo!.id}
          filePath={selectedFile!.path}
          content={currentContent}
          commitMessage={commitMessage}
          ticketId={ticketId}
          branchName={branchName}
        />
      )}

      {currentStep === 5 && updateResult && (
        <SuccessScreen
          result={updateResult}
          repositoryName={selectedRepo?.name || ''}
          fileName={selectedFile?.name || ''}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}
