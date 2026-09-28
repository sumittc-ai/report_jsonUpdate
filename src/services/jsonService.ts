// ============================================================
// JSON Service
// ============================================================
import { gitlabApi } from '../api/gitlabApi';
import type { ConfigFile, ValidationResult, JsonDiff } from '../types';

export const jsonService = {
  async getConfigFiles(repositoryId: string): Promise<ConfigFile[]> {
    return gitlabApi.getConfigFiles(repositoryId);
  },

  async getFileContent(repositoryId: string, fileId: string): Promise<string> {
    return gitlabApi.getFileContent(repositoryId, fileId);
  },

  validate(content: string): ValidationResult {
    try {
      JSON.parse(content);
      return { valid: true };
    } catch (e) {
      const error = e as SyntaxError;
      const match = error.message.match(/position (\d+)/i);
      const position = match ? parseInt(match[1], 10) : 0;
      const lines = content.substring(0, position).split('\n');
      return {
        valid: false,
        error: error.message,
        line: lines.length,
        column: position - content.lastIndexOf('\n', position - 1),
      };
    }
  },

  format(content: string): string {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  },

  computeDiff(oldContent: string, newContent: string): JsonDiff[] {
    try {
      const oldObj = JSON.parse(oldContent);
      const newObj = JSON.parse(newContent);
      return this.deepDiff(oldObj, newObj, '');
    } catch {
      return [];
    }
  },

  deepDiff(oldObj: Record<string, unknown>, newObj: Record<string, unknown>, prefix: string): JsonDiff[] {
    const diffs: JsonDiff[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      const path = prefix ? `${prefix}.${key}` : key;
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (!(key in oldObj)) {
        diffs.push({ type: 'added', key, path, newValue: newVal });
      } else if (!(key in newObj)) {
        diffs.push({ type: 'removed', key, path, oldValue: oldVal });
      } else if (
        typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) &&
        typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)
      ) {
        diffs.push(...this.deepDiff(oldVal as Record<string, unknown>, newVal as Record<string, unknown>, path));
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({ type: 'modified', key, path, oldValue: oldVal, newValue: newVal });
      }
    }

    return diffs;
  },
};
