import { apiSlice } from '@/app/api/apiSlice';
import type { Member } from '@/types/group';

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

export interface TaskWithAssignee extends TaskResponse {
  assignee?: Member;
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
  sortBy?: 'CreatedAt' | 'UpdatedAt';
  order?: 'asc' | 'desc';
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

export interface AssignTaskRequest {
  assigneeUserId: string;
}

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<PagedResult<TaskResponse>, TaskListQuery>({
      query: (params) => ({ url: '/tasks', params }),
      transformResponse: (response: any) => response.data || response,
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((t) => ({ type: 'Task' as const, id: t.id })),
              { type: 'Task' as const, id: 'LIST' },
            ]
          : [{ type: 'Task' as const, id: 'LIST' }],
    }),
    createTask: builder.mutation<{ id: string }, CreateTaskRequest>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
    assignTask: builder.mutation<void, { taskId: string; assigneeUserId: string }>({
      query: ({ taskId, assigneeUserId }) => ({
        url: `/tasks/${taskId}/assign`,
        method: 'PATCH',
        body: { assigneeUserId },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Task', id: taskId },
        { type: 'Task', id: 'LIST' },
      ],
    }),
    unassignTask: builder.mutation<void, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}/unassign`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: 'Task', id: taskId },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useAssignTaskMutation,
  useUnassignTaskMutation,
} = tasksApi;
