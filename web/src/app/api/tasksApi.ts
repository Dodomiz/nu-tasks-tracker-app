import { apiSlice } from './apiSlice';

export interface CreateTaskRequest {
  groupId: string;
  assignedUserId: string;
  templateId?: string | null;
  name: string;
  description?: string | null;
  difficulty: number;
  dueAt: string; // ISO string
  frequency: 'OneTime' | 'Daily' | 'Weekly' | 'BiWeekly' | 'Monthly' | 'Quarterly' | 'Yearly';
}

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<{ id: string }, CreateTaskRequest>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const { useCreateTaskMutation } = tasksApi;