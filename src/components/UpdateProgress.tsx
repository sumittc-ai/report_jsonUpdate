import { useState, useEffect } from 'react';
import { CheckCircle, Loader, GitBranch, FileJson, GitCommit, GitPullRequest } from 'lucide-react';
import type { UpdateStep, StepStatus } from '../services/updateService';

interface ProgressStep {
  step: UpdateStep;
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
  message: string;
}

interface UpdateProgressProps {
  onComplete: () => void;
  repositoryId: string;
  filePath: string;
  content: string;
  commitMessage: string;
  ticketId: string;
  branchName: string;
}

export function UpdateProgress({
  onComplete,
  branchName,
}: UpdateProgressProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { step: 'branch', label: 'Creating Branch', icon: <GitBranch size={16} />, status: 'pending', message: 'Waiting...' },
    { step: 'file', label: 'Updating File', icon: <FileJson size={16} />, status: 'pending', message: 'Waiting...' },
    { step: 'commit', label: 'Creating Commit', icon: <GitCommit size={16} />, status: 'pending', message: 'Waiting...' },
    { step: 'merge-request', label: 'Creating Merge Request', icon: <GitPullRequest size={16} />, status: 'pending', message: 'Waiting...' },
  ]);

  useEffect(() => {
    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Set current step to running
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'running', message: `${s.label}...` } : s
          )
        );

        // Simulate work
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

        // Set current step to success
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'success', message: `${s.label.replace('Creating', 'Created').replace('Updating', 'Updated')}` } : s
          )
        );
      }

      // All done
      await new Promise((r) => setTimeout(r, 500));
      onComplete();
    };

    runSteps();
  }, []);

  return (
    <div className="card fade-in" style={{ padding: 32, maxWidth: 520, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--color-accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Loader size={24} color="var(--color-accent-primary)" className="animate-spin" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
          Pushing to GitLab
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
          Branch: <span className="mono" style={{ color: 'var(--color-accent-primary)' }}>{branchName}</span>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map((s) => (
          <div
            key={s.step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: s.status === 'running'
                ? 'var(--color-accent-muted)'
                : s.status === 'success'
                ? 'var(--color-success-muted)'
                : 'var(--color-bg-primary)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {s.status === 'success' ? (
                <CheckCircle size={16} color="var(--color-success)" />
              ) : s.status === 'running' ? (
                <Loader size={16} color="var(--color-accent-primary)" className="animate-spin" />
              ) : (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid var(--color-border-default)',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: s.status === 'running' ? 500 : 400,
                color: s.status === 'pending'
                  ? 'var(--color-text-muted)'
                  : s.status === 'running'
                  ? 'var(--color-text-primary)'
                  : 'var(--color-success)',
              }}
            >
              {s.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
