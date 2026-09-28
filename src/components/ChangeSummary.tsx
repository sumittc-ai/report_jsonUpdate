import { useMemo } from 'react';
import { Plus, Minus, Edit3 } from 'lucide-react';
import { jsonService } from '../services/jsonService';
import type { JsonDiff } from '../types';

interface ChangeSummaryProps {
  originalContent: string;
  currentContent: string;
}

export function ChangeSummary({ originalContent, currentContent }: ChangeSummaryProps) {
  const diffs = useMemo(
    () => jsonService.computeDiff(originalContent, currentContent),
    [originalContent, currentContent]
  );

  const modified = diffs.filter((d) => d.type === 'modified');
  const added = diffs.filter((d) => d.type === 'added');
  const removed = diffs.filter((d) => d.type === 'removed');

  const totalChanges = diffs.length;
  const hasChanges = totalChanges > 0;

  return (
    <div className="card fade-in" style={{ padding: 0, height: 'fit-content' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Change Summary
        </h3>
        {hasChanges && (
          <span className="badge badge-info">
            {totalChanges} {totalChanges === 1 ? 'change' : 'changes'}
          </span>
        )}
      </div>

      <div style={{ padding: 16 }}>
        {!hasChanges ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
            No changes detected
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {modified.length > 0 && (
              <DiffSection
                title="Modified"
                icon={<Edit3 size={12} />}
                items={modified}
                color="var(--color-warning)"
                bgColor="var(--color-warning-muted)"
              />
            )}
            {added.length > 0 && (
              <DiffSection
                title="Added"
                icon={<Plus size={12} />}
                items={added}
                color="var(--color-success)"
                bgColor="var(--color-success-muted)"
              />
            )}
            {removed.length > 0 && (
              <DiffSection
                title="Removed"
                icon={<Minus size={12} />}
                items={removed}
                color="var(--color-error)"
                bgColor="var(--color-error-muted)"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DiffSectionProps {
  title: string;
  icon: React.ReactNode;
  items: JsonDiff[];
  color: string;
  bgColor: string;
}

function DiffSection({ title, icon, items, color, bgColor }: DiffSectionProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item) => (
          <div
            key={item.path}
            style={{
              padding: '6px 10px',
              background: bgColor,
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
            }}
          >
            <div className="mono" style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: item.type === 'modified' ? 4 : 0 }}>
              {item.path}
            </div>
            {item.type === 'modified' && (
              <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--color-error)' }}>
                  {JSON.stringify(item.oldValue)}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                <span style={{ color: 'var(--color-success)' }}>
                  {JSON.stringify(item.newValue)}
                </span>
              </div>
            )}
            {item.type === 'added' && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--color-success)' }}>
                {JSON.stringify(item.newValue)}
              </div>
            )}
            {item.type === 'removed' && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--color-error)' }}>
                {JSON.stringify(item.oldValue)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
