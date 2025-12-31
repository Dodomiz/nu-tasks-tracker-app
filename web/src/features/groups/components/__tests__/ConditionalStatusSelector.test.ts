import { describe, it, expect } from 'vitest';

describe('Conditional Status Selector Logic', () => {
  const getAvailableStatuses = (
    requiresApproval: boolean,
    isAdmin: boolean,
    isAssignee: boolean
  ) => {
    if (requiresApproval) {
      if (isAdmin) {
        return ['Pending', 'InProgress', 'WaitingForApproval', 'Completed'];
      } else {
        return ['Pending', 'InProgress', 'WaitingForApproval'];
      }
    } else {
      if (isAdmin || isAssignee) {
        return ['Pending', 'InProgress', 'Completed'];
      } else {
        return ['Pending', 'InProgress'];
      }
    }
  };

  describe('Approval-required tasks', () => {
    it('admin sees all statuses including Completed', () => {
      const statuses = getAvailableStatuses(true, true, false);
      
      expect(statuses).toContain('Pending');
      expect(statuses).toContain('InProgress');
      expect(statuses).toContain('WaitingForApproval');
      expect(statuses).toContain('Completed');
      expect(statuses).toHaveLength(4);
    });

    it('member (assignee) cannot see Completed status', () => {
      const statuses = getAvailableStatuses(true, false, true);
      
      expect(statuses).toContain('Pending');
      expect(statuses).toContain('InProgress');
      expect(statuses).toContain('WaitingForApproval');
      expect(statuses).not.toContain('Completed');
      expect(statuses).toHaveLength(3);
    });

    it('member (non-assignee) cannot see Completed status', () => {
      const statuses = getAvailableStatuses(true, false, false);
      
      expect(statuses).toContain('Pending');
      expect(statuses).toContain('InProgress');
      expect(statuses).toContain('WaitingForApproval');
      expect(statuses).not.toContain('Completed');
      expect(statuses).toHaveLength(3);
    });
  });

  describe('Standard tasks (no approval required)', () => {
    it('admin sees standard statuses including Completed', () => {
      const statuses = getAvailableStatuses(false, true, false);
      
      expect(statuses).toContain('Pending');
      expect(statuses).toContain('InProgress');
      expect(statuses).toContain('Completed');
      expect(statuses).not.toContain('WaitingForApproval');
      expect(statuses).toHaveLength(3);
    });

    it('assignee sees standard statuses including Completed', () => {
      const statuses = getAvailableStatuses(false, false, true);
      
      expect(statuses).toContain('Pending');
      expect(statuses).toContain('InProgress');
      expect(statuses).toContain('Completed');
      expect(statuses).not.toContain('WaitingForApproval');
      expect(statuses).toHaveLength(3);
    });

    it('non-admin non-assignee sees limited statuses', () => {
      const statuses = getAvailableStatuses(false, false, false);
      
      expect(statuses).toContain('Pending');
      expect(statuses).toContain('InProgress');
      expect(statuses).not.toContain('Completed');
      expect(statuses).not.toContain('WaitingForApproval');
      expect(statuses).toHaveLength(2);
    });
  });

  describe('Regression: Existing behavior preserved', () => {
    it('admin can still complete any standard task', () => {
      const statuses = getAvailableStatuses(false, true, false);
      expect(statuses).toContain('Completed');
    });

    it('assignee can still complete their own standard task', () => {
      const statuses = getAvailableStatuses(false, false, true);
      expect(statuses).toContain('Completed');
    });

    it('member cannot complete someone elses standard task', () => {
      const statuses = getAvailableStatuses(false, false, false);
      expect(statuses).not.toContain('Completed');
    });
  });
});
