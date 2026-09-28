import React from 'react';
import { useEnvironment } from '../hooks/useEnvironment';
import { useToast } from '../hooks/useToast';
import { Server, Globe, Check } from 'lucide-react';
import type { ApiEnvironment } from '../config/apiConfig';

interface EnvironmentSelectorProps {
  variant?: 'compact' | 'full' | 'radio';
  className?: string;
  onEnvChange?: (newEnv: ApiEnvironment) => void;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  variant = 'compact',
  onEnvChange,
}) => {
  const { environment, setEnvironment, envInfo, environments } = useEnvironment();
  const { addToast } = useToast();

  const handleSelect = (env: ApiEnvironment) => {
    if (env === environment) return;
    setEnvironment(env);
    addToast(
      'info',
      `Switched to ${environments[env].name} environment (${environments[env].url})`
    );
    if (onEnvChange) {
      onEnvChange(env);
    }
  };

  if (variant === 'radio') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '4px 10px',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          <Server size={12} />
          <span>Target Env:</span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {(['QA', 'PROD'] as const).map((env) => {
            const isSelected = environment === env;
            const info = environments[env];
            return (
              <label
                key={env}
                onClick={() => handleSelect(env)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? info.badgeBg : 'transparent',
                  border: isSelected
                    ? `1px solid ${info.badgeBorder}`
                    : '1px solid transparent',
                  color: isSelected ? info.badgeColor : 'var(--color-text-tertiary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 11,
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
                title={info.description}
              >
                <input
                  type="radio"
                  name="api-environment-radio"
                  checked={isSelected}
                  onChange={() => handleSelect(env)}
                  style={{
                    accentColor: env === 'QA' ? '#38bdf8' : '#f59e0b',
                    cursor: 'pointer',
                    margin: 0,
                    width: 13,
                    height: 13,
                  }}
                />
                <span>{info.name}</span>
                {isSelected && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: info.badgeColor,
                      boxShadow: `0 0 6px ${info.badgeColor}`,
                    }}
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact / Segmented Radio Pill
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px',
        background: 'var(--color-bg-tertiary, #141724)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md, 6px)',
      }}
      title={`Active: ${envInfo.description}`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 6px',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.3px',
        }}
      >
        <Globe size={11} color={envInfo.badgeColor} />
        <span>ENV:</span>
      </div>

      <div style={{ display: 'inline-flex', gap: 2 }}>
        {(['QA', 'PROD'] as const).map((env) => {
          const isSelected = environment === env;
          const info = environments[env];
          return (
            <button
              key={env}
              type="button"
              onClick={() => handleSelect(env)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: isSelected ? 700 : 500,
                border: isSelected
                  ? `1px solid ${info.badgeBorder}`
                  : '1px solid transparent',
                cursor: 'pointer',
                background: isSelected ? info.badgeBg : 'transparent',
                color: isSelected ? info.badgeColor : 'var(--color-text-tertiary)',
                transition: 'all 0.15s ease',
              }}
              title={info.description}
            >
              <input
                type="radio"
                name={`api-env-pill-${variant}`}
                checked={isSelected}
                onChange={() => handleSelect(env)}
                style={{
                  accentColor: env === 'QA' ? '#38bdf8' : '#f59e0b',
                  cursor: 'pointer',
                  margin: 0,
                  width: 11,
                  height: 11,
                }}
              />
              <span>{env}</span>
              {isSelected && <Check size={10} strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
