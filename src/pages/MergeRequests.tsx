import { useState, useEffect, useMemo } from 'react';
import { Search, GitPullRequest, GitBranch, Clock, ExternalLink, User } from 'lucide-react';
import { gitlabApi } from '../api/gitlabApi';
import type { MergeRequest } from '../types';

export function MergeRequestsPage() {
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    gitlabApi.getMergeRequests().then((mrs) => {
      setMergeRequests(mrs);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = mergeRequests;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (mr) =>
          mr.title.toLowerCase().includes(q) ||
          mr.repository.toLowerCase().includes(q) ||
          mr.sourceBranch.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((mr) => mr.status === statusFilter);
    }
    return result;
  }, [mergeRequests, search, statusFilter]);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      opened: 'badge-info',
      merged: 'badge-success',
      closed: 'badge-default',
      failed: 'badge-error',
    };
    return <span className={`badge ${cls[status] || 'badge-default'}`}>{status}</span>;
  };

  function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <div className="skeleton" style={{ width: 250, height: 28, marginBottom: 24 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 120, marginBottom: 12, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
          Merge Requests
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
          All merge requests generated from JSON configuration updates.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
          />
          <input
            className="input"
            placeholder="Search merge requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 160, cursor: 'pointer', appearance: 'none' }}
        >
          <option value="all">All Statuses</option>
          <option value="opened">Opened</option>
          <option value="merged">Merged</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* MR Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
            No merge requests found
          </div>
        ) : (
          filtered.map((mr) => (
            <div key={mr.id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <GitPullRequest
                      size={16}
                      color={mr.status === 'opened' ? 'var(--color-info)' : mr.status === 'merged' ? 'var(--color-success)' : 'var(--color-text-tertiary)'}
                    />
                    <span className="mono" style={{ fontSize: 13, color: 'var(--color-accent-primary)', fontWeight: 600 }}>
                      !{mr.iid}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {mr.title}
                    </span>
                    {statusBadge(mr.status)}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
                    {mr.description}
                  </p>
                  <div style={{ display: 'flex', gap: 20, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitBranch size={12} />
                      <span className="mono">{mr.sourceBranch}</span>
                      <span>→</span>
                      <span className="mono">{mr.targetBranch}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} />
                      {mr.author}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {formatTimeAgo(mr.createdAt)}
                    </span>
                  </div>
                </div>
                <a
                  href={mr.webUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ flexShrink: 0 }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
