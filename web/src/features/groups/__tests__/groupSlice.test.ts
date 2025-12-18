import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore, type Store } from '@reduxjs/toolkit';
import groupReducer, {
  setCurrentGroup,
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading,
  setError,
  clearError,
  selectCurrentGroupId,
  selectGroups,
  selectCurrentGroup,
  selectIsAdmin,
} from '../groupSlice';
import type { Group } from '@/types/group';

interface TestState {
  group: ReturnType<typeof groupReducer>;
}

describe('groupSlice', () => {
  let store: Store<TestState>;

  const mockGroup1: Group = {
    id: '1',
    name: 'Test Group 1',
    description: 'Description 1',
    category: 'work',
    memberCount: 5,
    myRole: 'Admin',
    createdAt: '2025-01-01T00:00:00Z',
  };

  const mockGroup2: Group = {
    id: '2',
    name: 'Test Group 2',
    category: 'personal',
    memberCount: 3,
    myRole: 'RegularUser',
    createdAt: '2025-01-02T00:00:00Z',
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        group: groupReducer,
      },
    });
  });

  describe('setCurrentGroup', () => {
    it('should set current group ID and find group in list', () => {
      store.dispatch(setGroups([mockGroup1, mockGroup2]));
      store.dispatch(setCurrentGroup('1'));

      const state = store.getState().group;
      expect(state.currentGroupId).toBe('1');
      expect(state.currentGroup).toEqual(mockGroup1);
    });

    it('should clear current group when ID is null', () => {
      store.dispatch(setGroups([mockGroup1]));
      store.dispatch(setCurrentGroup('1'));
      store.dispatch(setCurrentGroup(null));

      const state = store.getState().group;
      expect(state.currentGroupId).toBeNull();
      expect(state.currentGroup).toBeNull();
    });
  });

  describe('setGroups', () => {
    it('should set groups list', () => {
      store.dispatch(setGroups([mockGroup1, mockGroup2]));

      const state = store.getState().group;
      expect(state.groups).toHaveLength(2);
      expect(state.groups[0]).toEqual(mockGroup1);
    });

    it('should update current group if it exists in new list', () => {
      store.dispatch(setCurrentGroup('1'));
      store.dispatch(setGroups([mockGroup1, mockGroup2]));

      const state = store.getState().group;
      expect(state.currentGroup).toEqual(mockGroup1);
    });
  });

  describe('addGroup', () => {
    it('should add group to list', () => {
      store.dispatch(addGroup(mockGroup1));

      const state = store.getState().group;
      expect(state.groups).toHaveLength(1);
      expect(state.groups[0]).toEqual(mockGroup1);
    });

    it('should set as current group if first group', () => {
      store.dispatch(addGroup(mockGroup1));

      const state = store.getState().group;
      expect(state.currentGroupId).toBe('1');
      expect(state.currentGroup).toEqual(mockGroup1);
    });

    it('should not change current group if not first', () => {
      store.dispatch(addGroup(mockGroup1));
      store.dispatch(addGroup(mockGroup2));

      const state = store.getState().group;
      expect(state.currentGroupId).toBe('1');
      expect(state.groups).toHaveLength(2);
    });
  });

  describe('updateGroup', () => {
    it('should update group in list', () => {
      store.dispatch(setGroups([mockGroup1]));

      const updated = { ...mockGroup1, name: 'Updated Name' };
      store.dispatch(updateGroup(updated));

      const state = store.getState().group;
      expect(state.groups[0].name).toBe('Updated Name');
    });

    it('should update current group if it matches', () => {
      store.dispatch(setGroups([mockGroup1]));
      store.dispatch(setCurrentGroup('1'));

      const updated = { ...mockGroup1, name: 'Updated Name' };
      store.dispatch(updateGroup(updated));

      const state = store.getState().group;
      expect(state.currentGroup?.name).toBe('Updated Name');
    });
  });

  describe('removeGroup', () => {
    it('should remove group from list', () => {
      store.dispatch(setGroups([mockGroup1, mockGroup2]));
      store.dispatch(removeGroup('1'));

      const state = store.getState().group;
      expect(state.groups).toHaveLength(1);
      expect(state.groups[0].id).toBe('2');
    });

    it('should clear current group if removed', () => {
      store.dispatch(setGroups([mockGroup1]));
      store.dispatch(setCurrentGroup('1'));
      store.dispatch(removeGroup('1'));

      const state = store.getState().group;
      expect(state.currentGroupId).toBeNull();
      expect(state.currentGroup).toBeNull();
    });
  });

  describe('loading and error states', () => {
    it('should set loading state', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().group.loading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().group.loading).toBe(false);
    });

    it('should set and clear error', () => {
      store.dispatch(setError('Test error'));
      expect(store.getState().group.error).toBe('Test error');

      store.dispatch(clearError());
      expect(store.getState().group.error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('should select current group ID', () => {
      store.dispatch(setCurrentGroup('1'));
      const groupId = selectCurrentGroupId(store.getState() as any);
      expect(groupId).toBe('1');
    });

    it('should select groups list', () => {
      store.dispatch(setGroups([mockGroup1, mockGroup2]));
      const groups = selectGroups(store.getState() as any);
      expect(groups).toHaveLength(2);
    });

    it('should select current group', () => {
      store.dispatch(setGroups([mockGroup1]));
      store.dispatch(setCurrentGroup('1'));
      const group = selectCurrentGroup(store.getState() as any);
      expect(group).toEqual(mockGroup1);
    });

    it('should select isAdmin based on role', () => {
      store.dispatch(setGroups([mockGroup1]));
      store.dispatch(setCurrentGroup('1'));
      const isAdmin = selectIsAdmin(store.getState() as any);
      expect(isAdmin).toBe(true);
    });

    it('should return false for isAdmin if regular user', () => {
      store.dispatch(setGroups([mockGroup2]));
      store.dispatch(setCurrentGroup('2'));
      const isAdmin = selectIsAdmin(store.getState() as any);
      expect(isAdmin).toBe(false);
    });
  });
});
