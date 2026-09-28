import { useState, useEffect } from 'react';
import { Save, CheckCircle, Globe, GitBranch, FileJson, Shield } from 'lucide-react';
import { gitlabApi } from '../api/gitlabApi';
import { useToast } from '../hooks/useToast';
import type { AppSettings } from '../types';

export function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    gitlabApi.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await gitlabApi.updateSettings(settings);
    setSaving(false);
    addToast('success', 'Settings saved successfully');
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '100%', height: 500, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '24px 32px', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Settings
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            Configure GitLab connection and default behaviors.
          </p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* GitLab Connection */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Globe size={16} color="var(--color-accent-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
              GitLab Connection
            </h3>
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
              <CheckCircle size={10} /> Connected
            </span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              GitLab URL
            </label>
            <input
              className="input"
              value={settings.gitlabUrl}
              onChange={(e) => setSettings({ ...settings, gitlabUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Branch Settings */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <GitBranch size={16} color="var(--color-accent-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
              Branch & Commit
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Default Source Branch
              </label>
              <input
                className="input"
                value={settings.defaultBranch}
                onChange={(e) => setSettings({ ...settings, defaultBranch: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Branch Naming Pattern
              </label>
              <input
                className="input mono"
                value={settings.branchPattern}
                onChange={(e) => setSettings({ ...settings, branchPattern: e.target.value })}
              />
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Available: {'{ticketId}'}, {'{timestamp}'}, {'{date}'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Default Commit Message Pattern
              </label>
              <input
                className="input mono"
                value={settings.commitPattern}
                onChange={(e) => setSettings({ ...settings, commitPattern: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* JSON Validation */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileJson size={16} color="var(--color-accent-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
              JSON Validation
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.jsonValidation.strictMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    jsonValidation: { ...settings.jsonValidation, strictMode: e.target.checked },
                  })
                }
                style={{ accentColor: 'var(--color-accent-primary)' }}
              />
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Strict Mode</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Enforce strict JSON parsing rules</div>
              </div>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Max Depth
                </label>
                <input
                  className="input"
                  type="number"
                  value={settings.jsonValidation.maxDepth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      jsonValidation: { ...settings.jsonValidation, maxDepth: parseInt(e.target.value) || 10 },
                    })
                  }
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Max File Size (bytes)
                </label>
                <input
                  className="input"
                  type="number"
                  value={settings.jsonValidation.maxSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      jsonValidation: { ...settings.jsonValidation, maxSize: parseInt(e.target.value) || 102400 },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '14px 16px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            fontSize: 12,
            color: 'var(--color-text-secondary)',
          }}
        >
          <Shield size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>Security</div>
            GitLab access tokens are stored securely on the backend server. They are never exposed to the frontend application.
            All API calls are proxied through the backend service.
          </div>
        </div>
      </div>
    </div>
  );
}
