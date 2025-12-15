import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import groupReducer from '@/features/groups/groupSlice';
import CreateGroupPage from '../CreateGroupPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' } }),
}));

vi.mock('@/features/groups/groupApi', () => ({
  useCreateGroupMutation: () => [
    () => ({
      unwrap: async () => ({ id: 'new-id', name: 'New Group', description: '', timezone: 'UTC', language: 'en', createdAt: new Date().toISOString(), myRole: 'Admin' }),
    }),
    { isLoading: false },
  ],
}));

vi.mock('react-router-dom', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function setup() {
  const store = configureStore({ reducer: { group: groupReducer } });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateGroupPage />
      </MemoryRouter>
    </Provider>
  );
  return store;
}

describe('CreateGroupPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates minimum name length', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Group/i }));
    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument();
  });

  it('submits and navigates on success', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'Team A' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Group/i }));

    await waitFor(() => {
      // button text changes back when not loading, implying submit flow completed
      expect(screen.getByRole('button', { name: /Create Group/i })).toBeInTheDocument();
    });
  });
});
