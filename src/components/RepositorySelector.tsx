import { useState, useMemo } from 'react';
import { Search, FolderGit2, Clock, ChevronRight } from 'lucide-react';
import type { Repository } from '../types';

interface RepositorySelectorProps {
  repositories: Repository[];
  selectedId: string | null;
  onSelect: (repo: Repository) => void;
  loading?: boolean;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export function RepositorySelector({ repositories, selectedId, onSelect, loading }: RepositorySelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return repositories;
    const q = search.toLowerCase();
    return repositories.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [repositories, search]);

  if (loading) {
    return (
      <div className="card fade-in" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 180, height: 20, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 280, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: 40, marginBottom: 16 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 64, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
          Select Repository
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
          Choose the microservice you want to update.
        </p>
      </div>

      {/* Search */}
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
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Source branch indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        <FolderGit2 size={14} />
        <span>Source branch:</span>
        <span className="mono" style={{ color: 'var(--color-accent-primary)', fontWeight: 500 }}>master</span>
      </div>

      {/* Repository list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 420, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            No repositories found
          </div>
        ) : (
          filtered.map((repo) => {
            const isSelected = repo.id === selectedId;
            return (
              <button
                key={repo.id}
                onClick={() => onSelect(repo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
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
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: isSelected
                      ? 'var(--color-accent-primary)'
                      : 'var(--color-bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s ease',
                  }}
                >
                  <FolderGit2
                    size={16}
                    color={isSelected ? 'white' : 'var(--color-text-tertiary)'}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                    {repo.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {repo.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <Clock size={12} />
                    {formatTimeAgo(repo.lastUpdated)}
                  </div>
                  <span
                    className={`status-dot ${repo.status === 'connected' ? 'status-dot-connected' : 'status-dot-disconnected'}`}
                  />
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
