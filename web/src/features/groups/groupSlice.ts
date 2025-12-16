import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { Group } from '@/types/group';

interface GroupState {
  currentGroupId: string | null;
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
}

// Load persisted group ID from localStorage
const loadPersistedGroupId = (): string | null => {
  try {
    const persistedId = localStorage.getItem('currentGroupId');
    return persistedId || null;
  } catch (error) {
    console.error('Failed to load persisted group ID:', error);
    return null;
  }
};

// Save group ID to localStorage
const persistGroupId = (groupId: string | null): void => {
  try {
    if (groupId) {
      localStorage.setItem('currentGroupId', groupId);
    } else {
      localStorage.removeItem('currentGroupId');
    }
  } catch (error) {
    console.error('Failed to persist group ID:', error);
  }
};

const initialState: GroupState = {
  currentGroupId: loadPersistedGroupId(),
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setCurrentGroup: (state, action: PayloadAction<string | null>) => {
      state.currentGroupId = action.payload;
      persistGroupId(action.payload);
      if (action.payload) {
        state.currentGroup = state.groups.find(g => g.id === action.payload) || null;
      } else {
        state.currentGroup = null;
      }
    },
    hydrateGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
      // Restore current group from persisted ID if it exists in the groups list
      if (state.currentGroupId) {
        const foundGroup = action.payload.find(g => g.id === state.currentGroupId);
        if (foundGroup) {
          state.currentGroup = foundGroup;
        } else {
          // Persisted group no longer exists, clear it
          state.currentGroupId = null;
          state.currentGroup = null;
          persistGroupId(null);
        }
      }
    },
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
      // If current group is set, update it from the new list
      if (state.currentGroupId) {
        state.currentGroup = action.payload.find(g => g.id === state.currentGroupId) || null;
      }
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
      // Automatically set as current group if it's the first one
      if (state.groups.length === 1) {
        state.currentGroupId = action.payload.id;
        state.currentGroup = action.payload;
      }
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const index = state.groups.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
        // Update current group if it's the one being updated
        if (state.currentGroupId === action.payload.id) {
          state.currentGroup = action.payload;
        }
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(g => g.id !== action.payload);
      // Clear current group if it was the one removed
      if (state.currentGroupId === action.payload) {
        state.currentGroupId = null;
        state.currentGroup = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentGroup,
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading,
  setError,
  clearError,
hydrateGroups,
} = groupSlice.actions;

// Selectors
export const selectCurrentGroupId = (state: RootState) => state.group.currentGroupId;
export const selectGroups = (state: RootState) => state.group.groups;
export const selectCurrentGroup = (state: RootState) => state.group.currentGroup;
export const selectGroupLoading = (state: RootState) => state.group.loading;
export const selectGroupError = (state: RootState) => state.group.error;
export const selectIsAdmin = (state: RootState) => 
  state.group.currentGroup?.myRole === 'Admin';

export default groupSlice.reducer;
