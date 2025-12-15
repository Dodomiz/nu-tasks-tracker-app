import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelector } from '@/features/categories/components/CategorySelector';
import type { Category } from '@/types/category';
import React from 'react';

const makeCategories = (): Category[] => [
  {
    id: '',
    groupId: 'g1',
    name: 'House',
    icon: 'home',
    color: 'orange-500',
    isSystemCategory: true,
    taskCount: 0,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'c1',
    groupId: 'g1',
    name: 'Finance',
    icon: 'currency-dollar',
    color: 'emerald-600',
    isSystemCategory: false,
    taskCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    groupId: 'g1',
    name: 'Shopping',
    icon: 'shopping-cart',
    color: 'pink-600',
    isSystemCategory: false,
    taskCount: 1,
    createdAt: new Date().toISOString(),
  },
];

describe('CategorySelector', () => {
  it('renders placeholder when no selection', () => {
    render(
      <CategorySelector
        value={null}
        onChange={() => {}}
        categories={makeCategories()}
        placeholder="Select a category"
        label="Category"
      />
    );

    expect(screen.getByText('Select a category')).toBeInTheDocument();
  });

  it('opens list, filters by search, and selects an option', async () => {
    const user = userEvent.setup();
    let selected: string | null = null;
    render(
      <CategorySelector
        value={selected}
        onChange={(v) => {
          selected = v;
        }}
        categories={makeCategories()}
        label="Category"
      />
    );

    const button = screen.getByRole('button', { name: /category/i });
    await user.click(button);

    const search = screen.getByPlaceholderText('Search categories...');
    await user.type(search, 'Fin');

    const option = await screen.findByRole('option', { name: /finance/i });
    await user.click(option);

    // onChange was called and selection is reflected on button
    expect(selected).toBe('c1');
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('shows color dot with tailwind bg-* class', async () => {
    const user = userEvent.setup();
    render(
      <CategorySelector
        value={null}
        onChange={() => {}}
        categories={makeCategories()}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const option = await screen.findByRole('option', { name: /shopping/i });
    const dot = within(option).getByLabelText(/color: pink-600/i);
    expect(dot).toHaveClass('bg-pink-600');
  });

  it('allows clearing selection when not required', async () => {
    const user = userEvent.setup();
    let selected: string | null = 'c2';
    const categories = makeCategories();
    render(
      <CategorySelector
        value={selected}
        onChange={(v) => {
          selected = v;
        }}
        categories={categories}
        required={false}
      />
    );

    // Open and clear
    const button = screen.getByRole('button');
    await user.click(button);
    const clear = await screen.findByRole('option', { name: /(clear selection)/i });
    await user.click(clear);

    expect(selected).toBeNull();
  });
});
