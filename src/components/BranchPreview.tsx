import { useState } from 'react';
import { GitBranch, MessageSquare, Tag, AlertTriangle } from 'lucide-react';
import { branchService } from '../services/branchService';

interface BranchPreviewProps {
  repositoryName: string;
  fileName: string;
  onConfirm: (branchName: string, commitMessage: string, ticketId: string) => void;
  onBack: () => void;
}

export function BranchPreview({ repositoryName, fileName, onConfirm, onBack }: BranchPreviewProps) {
  const [ticketId, setTicketId] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update report configuration');

  const branchName = branchService.generateBranchName(ticketId || undefined);
  const fullCommitMessage = branchService.generateCommitMessage(ticketId || undefined, commitMessage);

  return (
    <div className="card fade-in" style={{ padding: 24 }}>
      {/* Branch Info */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <GitBranch size={18} color="var(--color-accent-primary)" />
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
            Branch & Commit
          </h3>
        </div>

        {/* Safety notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            background: 'var(--color-info-muted)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            fontSize: 12,
            color: 'var(--color-info)',
            lineHeight: 1.5,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            A new branch will be created from <span className="mono" style={{ fontWeight: 500 }}>master</span>.
            The master branch will not be modified directly. A merge request will be created for review.
          </span>
        </div>

        {/* Branch Preview */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            New Branch
          </div>
          <div className="mono" style={{ fontSize: 14, color: 'var(--color-accent-primary)', fontWeight: 500 }}>
            {branchName}
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <span>Source: <span className="mono" style={{ color: 'var(--color-text-primary)' }}>master</span></span>
            <span>Target: <span className="mono" style={{ color: 'var(--color-text-primary)' }}>master</span></span>
          </div>
        </div>
      </div>

      {/* Ticket ID */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          <Tag size={14} />
          Ticket / Issue ID
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          className="input"
          placeholder="e.g. RM12140"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
      </div>

      {/* Commit Message */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          <MessageSquare size={14} />
          Commit Message
        </label>
        <input
          className="input"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
        />
        <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
          Full message: {fullCommitMessage}
        </div>
      </div>

      {/* Summary */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          fontSize: 12,
        }}
      >
        <div>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>Repository</div>
          <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{repositoryName}</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>File</div>
          <div className="mono" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{fileName}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onBack}>
          Back to Review
        </button>
        <button
          className="btn-primary"
          onClick={() => onConfirm(branchName, fullCommitMessage, ticketId)}
        >
          <GitBranch size={14} />
          Create Branch & Push
        </button>
      </div>
    </div>
  );
}
