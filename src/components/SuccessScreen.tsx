import { CheckCircle, ExternalLink, Copy, ArrowLeft, GitBranch, GitCommit, GitPullRequest, FileJson, FolderGit2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import type { UpdateResult } from '../types';

interface SuccessScreenProps {
  result: UpdateResult;
  repositoryName: string;
  fileName: string;
  onBackToDashboard: () => void;
}

export function SuccessScreen({ result, repositoryName, fileName, onBackToDashboard }: SuccessScreenProps) {
  const { addToast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('info', `${label} copied to clipboard`);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
      {/* Success Icon */}
      <div className="scale-in" style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-success-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.2)',
          }}
        >
          <CheckCircle size={36} color="var(--color-success)" />
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
        Update Created Successfully
      </h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 32px 0', lineHeight: 1.6 }}>
        Your JSON configuration was updated and pushed to a new GitLab branch.
        <br />A merge request has been created for review.
      </p>

      {/* Details Card */}
      <div
        className="card"
        style={{
          padding: 0,
          textAlign: 'left',
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        {[
          { icon: <FolderGit2 size={15} />, label: 'Repository', value: repositoryName },
          { icon: <FileJson size={15} />, label: 'File', value: fileName },
          { icon: <GitBranch size={15} />, label: 'Branch', value: result.branch, copyable: true },
          { icon: <GitCommit size={15} />, label: 'Commit', value: result.commitShortId, copyable: true },
          { icon: <GitPullRequest size={15} />, label: 'Merge Request', value: `!${result.mergeRequestIid}` },
          {
            icon: (
              <div
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={10} color="white" />
              </div>
            ),
            label: 'Status',
            value: 'Opened',
            badge: true,
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: i < 5 ? '1px solid var(--color-border-subtle)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--color-text-tertiary)' }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {item.badge ? (
                <span className="badge badge-success">{item.value}</span>
              ) : (
                <span className="mono" style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {item.value}
                </span>
              )}
              {item.copyable && (
                <button
                  className="btn-ghost"
                  style={{ padding: 4 }}
                  onClick={() => copyToClipboard(item.value, item.label)}
                  title={`Copy ${item.label}`}
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onBackToDashboard}>
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>
        <a
          href={result.mergeRequestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <ExternalLink size={14} />
          Open Merge Request
        </a>
      </div>
    </div>
  );
}
