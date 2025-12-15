import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface TaskResponse {
  id: string;
  groupId: string;
  assignedUserId: string;
  templateId?: string;
  name: string;
  description?: string;
  difficulty: number;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Overdue';
  dueAt: string;
  isOverdue: boolean;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

export interface TaskListQuery {
  groupId?: string;
  status?: 'Pending' | 'InProgress' | 'Completed' | 'Overdue';
  assignedTo?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTaskRequest {
  groupId: string;
  assignedUserId: string;
  templateId?: string;
  name: string;
  description?: string;
  difficulty: number;
  dueAt: string; // ISO
  frequency: 'OneTime' | 'Daily' | 'Weekly' | 'Monthly';
}

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<PagedResult<TaskResponse>, TaskListQuery>({
      query: (params) => ({ url: 'tasks', params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((t) => ({ type: 'Tasks' as const, id: t.id })),
              { type: 'Tasks' as const, id: 'LIST' },
            ]
          : [{ type: 'Tasks' as const, id: 'LIST' }],
    }),
    createTask: builder.mutation<{ id: string }, CreateTaskRequest>({
      query: (body) => ({ url: 'tasks', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation } = tasksApi;
