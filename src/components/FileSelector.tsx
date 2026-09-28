import { useState, useMemo } from 'react';
import { Search, FileJson, Clock, ChevronRight } from 'lucide-react';
import type { ConfigFile } from '../types';

interface FileSelectorProps {
  files: ConfigFile[];
  selectedId: string | null;
  onSelect: (file: ConfigFile) => void;
  loading?: boolean;
  repositoryName?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function FileSelector({ files, selectedId, onSelect, loading, repositoryName }: FileSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }, [files, search]);

  if (loading) {
    return (
      <div className="card fade-in" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 180, height: 20, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 280, height: 14 }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 56, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
          Configuration File
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
          Select a JSON configuration file from{' '}
          <span className="mono" style={{ color: 'var(--color-accent-primary)' }}>{repositoryName}</span>
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}
        />
        <input
          className="input"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            No configuration files found
          </div>
        ) : (
          filtered.map((file) => {
            const isSelected = file.id === selectedId;
            return (
              <button
                key={file.id}
                onClick={() => onSelect(file)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: isSelected ? 'var(--color-accent-muted)' : 'var(--color-bg-primary)',
                  border: isSelected
                    ? '1px solid var(--color-accent-primary)'
                    : '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                    e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--color-border-default)';
                    e.currentTarget.style.background = 'var(--color-bg-primary)';
                  }
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--color-accent-primary)' : 'var(--color-bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileJson size={15} color={isSelected ? 'white' : 'var(--color-text-tertiary)'} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {file.name}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {file.path}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {formatSize(file.size)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <Clock size={12} />
                    {formatDate(file.lastModified)}
                  </div>
                  <ChevronRight size={14} color="var(--color-text-muted)" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
