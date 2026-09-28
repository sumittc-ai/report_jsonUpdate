import { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { AlignLeft, Check, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { jsonService } from '../services/jsonService';
import type { ValidationResult } from '../types';

interface JsonEditorProps {
  content: string;
  originalContent: string;
  onChange: (value: string) => void;
  onReset: () => void;
}

export function JsonEditor({ content, originalContent, onChange, onReset }: JsonEditorProps) {
  const editorRef = useRef<any>(null);
  const [validation, setValidation] = useState<ValidationResult>({ valid: true });

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    // Ctrl+S binding
    editor.addAction({
      id: 'save-json',
      label: 'Save JSON',
      keybindings: [2048 | 49], // Ctrl+S
      run: () => {
        handleFormat();
      },
    });
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      const val = value || '';
      onChange(val);
      setValidation(jsonService.validate(val));
    },
    [onChange]
  );

  const handleFormat = useCallback(() => {
    const formatted = jsonService.format(content);
    onChange(formatted);
    if (editorRef.current) {
      editorRef.current.setValue(formatted);
    }
  }, [content, onChange]);

  const handleValidate = useCallback(() => {
    setValidation(jsonService.validate(content));
  }, [content]);

  const handleReset = useCallback(() => {
    onChange(originalContent);
    if (editorRef.current) {
      editorRef.current.setValue(originalContent);
    }
    setValidation({ valid: true });
    onReset();
  }, [originalContent, onChange, onReset]);

  // Validate on mount
  useEffect(() => {
    setValidation(jsonService.validate(content));
  }, []);

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border-default)',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
          Current Configuration
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-ghost" onClick={handleFormat} title="Format JSON (Ctrl+S)">
            <AlignLeft size={14} />
            Format
          </button>
          <button className="btn-ghost" onClick={handleValidate} title="Validate JSON">
            <Check size={14} />
            Validate
          </button>
          <button className="btn-ghost" onClick={handleReset} title="Reset to original">
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ height: 420 }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={content}
          onChange={handleChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            tabSize: 2,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            renderLineHighlight: 'gutter',
            padding: { top: 12 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* Validation Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderTop: '1px solid var(--color-border-default)',
          fontSize: 12,
        }}
      >
        {validation.valid ? (
          <>
            <CheckCircle size={14} color="var(--color-success)" />
            <span style={{ color: 'var(--color-success)' }}>Valid JSON</span>
          </>
        ) : (
          <>
            <AlertCircle size={14} color="var(--color-error)" />
            <span style={{ color: 'var(--color-error)' }}>
              Invalid JSON{validation.line ? ` — Line ${validation.line}` : ''}
              {validation.error ? `: ${validation.error}` : ''}
            </span>
          </>
        )}

        {content !== originalContent && (
          <span style={{ marginLeft: 'auto', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-warning)' }} />
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
