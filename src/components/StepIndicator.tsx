import { Check } from 'lucide-react';
import type { WorkflowStep } from '../types';

const steps: WorkflowStep[] = [
  { id: 1, label: 'Repository', key: 'repository' },
  { id: 2, label: 'Configuration', key: 'configuration' },
  { id: 3, label: 'Edit', key: 'edit' },
  { id: 4, label: 'Review', key: 'review' },
  { id: 5, label: 'Merge Request', key: 'merge-request' },
];

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0' }}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);
        const isPast = step.id < currentStep;

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive
                  ? 'var(--color-accent-muted)'
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  background: isCompleted
                    ? 'var(--color-success)'
                    : isActive
                    ? 'var(--color-accent-primary)'
                    : 'var(--color-bg-hover)',
                  color: isCompleted || isActive
                    ? 'white'
                    : 'var(--color-text-tertiary)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : step.id.toString().padStart(2, '0')}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : isPast || isCompleted
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-text-tertiary)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                }}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: isPast || isCompleted
                    ? 'var(--color-accent-primary)'
                    : 'var(--color-border-default)',
                  margin: '0 4px',
                  transition: 'background 0.2s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
