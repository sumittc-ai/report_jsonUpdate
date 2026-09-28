import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Clock, FileJson, Settings, Search } from 'lucide-react';
import { gitlabApi } from '../api/gitlabApi';
import type { Repository } from '../types';

export function RepositoriesPage() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    gitlabApi.getRepositories().then((r) => {
      setRepos(r);
      setLoading(false);
    });
  }, []);

  function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  }

  const filtered = repos.filter((r) => {
    if (!search.trim()) return true;
    return r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Repositories
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            All configured report microservice repositories.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          className="input"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36, maxWidth: 400 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {filtered.map((repo) => (
          <div key={repo.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FolderGit2 size={18} color="var(--color-accent-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  {repo.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {repo.description}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span className={`status-dot ${repo.status === 'connected' ? 'status-dot-connected' : 'status-dot-disconnected'}`} />
              <span style={{ fontSize: 12, color: repo.status === 'connected' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {repo.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileJson size={12} />
                {repo.configFiles} config files
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                {formatTimeAgo(repo.lastUpdated)}
              </span>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                onClick={() => navigate('/json-update')}
              >
                <Settings size={13} />
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
