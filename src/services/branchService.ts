// ============================================================
// Branch Service
// ============================================================

export const branchService = {
  generateBranchName(ticketId?: string): string {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const suffix = ticketId ? `${ticketId}-${timestamp}` : `config-${timestamp}`;
    return `json-update/${suffix}`;
  },

  generateCommitMessage(ticketId?: string, description?: string): string {
    const desc = description || 'Update report configuration';
    if (ticketId) {
      return `${ticketId}: ${desc}`;
    }
    return desc;
  },
};
