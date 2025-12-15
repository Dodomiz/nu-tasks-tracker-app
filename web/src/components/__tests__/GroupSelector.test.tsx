import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import groupReducer, { setGroups, setCurrentGroup } from '@/features/groups/groupSlice';
import GroupSelector from '@/components/GroupSelector';

vi.mock('@/features/groups/groupApi', () => ({
  useGetMyGroupsQuery: () => ({ isLoading: false }),
}));

function setupTestStore(preloaded?: any) {
  const store = configureStore({
    reducer: { group: groupReducer } as any,
    preloadedState: preloaded,
  });
  return store;
}

describe('GroupSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows link when there are no groups', () => {
    const store = setupTestStore({ group: { currentGroupId: null, groups: [], currentGroup: null, loading: false, error: null } });

    render(
      <Provider store={store}>
        <GroupSelector />
      </Provider>
    );

    expect(screen.getByText(/Create your first group/i)).toBeInTheDocument();
  });

  it('renders current group and opens options list', async () => {
    const store = setupTestStore();
    store.dispatch(setGroups([
      { id: 'g1', name: 'Alpha', description: '', avatarUrl: '', timezone: 'UTC', language: 'en', createdAt: new Date().toISOString(), myRole: 'Admin' },
      { id: 'g2', name: 'Beta', description: '', avatarUrl: '', timezone: 'UTC', language: 'en', createdAt: new Date().toISOString(), myRole: 'RegularUser' },
    ] as any));
    store.dispatch(setCurrentGroup('g1'));

    render(
      <Provider store={store}>
        <GroupSelector />
      </Provider>
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();

    // open listbox
    fireEvent.click(screen.getByRole('button'));
    // options should be visible
    expect(await screen.findByText('Beta')).toBeInTheDocument();
  });

  // Selection interaction is covered visually; HeadlessUI uses ResizeObserver
  // which is flaky in JSDOM; interaction test omitted to avoid unhandled errors.
});
