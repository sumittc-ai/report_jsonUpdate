import { useMemo } from 'react';
import { jsonService } from '../services/jsonService';

interface DiffViewerProps {
  originalContent: string;
  modifiedContent: string;
  fileName: string;
  repositoryName: string;
}

export function DiffViewer({ originalContent, modifiedContent, fileName, repositoryName }: DiffViewerProps) {
  const diffs = useMemo(
    () => jsonService.computeDiff(originalContent, modifiedContent),
    [originalContent, modifiedContent]
  );

  // Build line-by-line diff display
  const oldLines = originalContent.split('\n');
  const newLines = modifiedContent.split('\n');

  // Simple line diff
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>
            Review Configuration Changes
          </h3>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 16 }}>
            <span>
              Repository: <span className="mono" style={{ color: 'var(--color-accent-primary)' }}>{repositoryName}</span>
            </span>
            <span>
              File: <span className="mono" style={{ color: 'var(--color-text-primary)' }}>{fileName}</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-error">{diffs.filter((d) => d.type === 'removed' || d.type === 'modified').length} removed</span>
          <span className="badge badge-success">{diffs.filter((d) => d.type === 'added' || d.type === 'modified').length} added</span>
        </div>
      </div>

      {/* Side-by-side diff */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'auto' }}>
        {/* Before */}
        <div style={{ borderRight: '1px solid var(--color-border-default)' }}>
          <div
            style={{
              padding: '8px 16px',
              background: 'var(--color-bg-tertiary)',
              borderBottom: '1px solid var(--color-border-default)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Before (master)
          </div>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: 0,
              fontSize: 12,
              lineHeight: '20px',
              overflowX: 'auto',
            }}
          >
            {oldLines.map((line, i) => {
              const newLine = newLines[i];
              const isRemoved = i < oldLines.length && line !== newLine && (i >= newLines.length || line.trim() !== newLine?.trim());
              return (
                <div
                  key={i}
                  style={{
                    padding: '0 16px',
                    display: 'flex',
                    background: isRemoved ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    borderLeft: isRemoved ? '3px solid var(--color-error)' : '3px solid transparent',
                    minHeight: 20,
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                      userSelect: 'none',
                      textAlign: 'right',
                      paddingRight: 12,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: isRemoved ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                    {line}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* After */}
        <div>
          <div
            style={{
              padding: '8px 16px',
              background: 'var(--color-bg-tertiary)',
              borderBottom: '1px solid var(--color-border-default)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            After (new branch)
          </div>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: 0,
              fontSize: 12,
              lineHeight: '20px',
              overflowX: 'auto',
            }}
          >
            {newLines.map((line, i) => {
              const oldLine = oldLines[i];
              const isAdded = line !== oldLine && (i >= oldLines.length || line.trim() !== oldLine?.trim());
              return (
                <div
                  key={i}
                  style={{
                    padding: '0 16px',
                    display: 'flex',
                    background: isAdded ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                    borderLeft: isAdded ? '3px solid var(--color-success)' : '3px solid transparent',
                    minHeight: 20,
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                      userSelect: 'none',
                      textAlign: 'right',
                      paddingRight: 12,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: isAdded ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                    {line}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
}
