import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Clock, GitBranch, GitCommit, GitPullRequest, FileJson } from 'lucide-react';
import { gitlabApi } from '../api/gitlabApi';
import type { UpdateRecord } from '../types';

export function HistoryPage() {
  const [history, setHistory] = useState<UpdateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    gitlabApi.getUpdateHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = history;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.repository.toLowerCase().includes(q) ||
          r.file.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q) ||
          r.user.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [history, search, statusFilter]);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      opened: 'badge-info',
      merged: 'badge-success',
      closed: 'badge-default',
      failed: 'badge-error',
    };
    return <span className={`badge ${cls[status] || 'badge-default'}`}>{status}</span>;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
          Update History
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
          Track all configuration updates and their statuses.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
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
            placeholder="Search by repository, file, branch, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={14} style={{ position: 'absolute', left: 12, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ paddingLeft: 32, width: 160, cursor: 'pointer', appearance: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="opened">Opened</option>
            <option value="merged">Merged</option>
            <option value="closed">Closed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              {['Date', 'Repository', 'File', 'Branch', 'Commit', 'MR', 'User', 'Status'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 14px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'left',
                    background: 'var(--color-bg-tertiary)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}
                >
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((record, i) => (
                <tr
                  key={record.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    transition: 'background 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} />
                      {formatDate(record.date)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {record.repository}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileJson size={12} />
                      {record.file.split('/').pop()}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitBranch size={12} />
                      {record.branch.length > 28 ? record.branch.substring(0, 28) + '...' : record.branch}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {record.commitId}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--color-accent-primary)', fontWeight: 500 }}>
                      !{record.mergeRequestIid}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {record.user}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {statusBadge(record.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
