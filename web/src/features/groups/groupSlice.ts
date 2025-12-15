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

const initialState: GroupState = {
  currentGroupId: null,
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
      if (action.payload) {
        state.currentGroup = state.groups.find(g => g.id === action.payload) || null;
      } else {
        state.currentGroup = null;
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
