import { apiSlice } from '@/app/api/apiSlice';
import type {
  TaskTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  GetTemplatesParams,
} from '@/types/template';

/**
 * Template API endpoints using RTK Query
 */
export const templateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all templates (system + group) for a group
    getTemplates: builder.query<TaskTemplate[], GetTemplatesParams>({
      query: ({ groupId, categoryId, difficultyMin, difficultyMax, frequency }) => {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (difficultyMin !== undefined) params.append('difficultyMin', difficultyMin.toString());
        if (difficultyMax !== undefined) params.append('difficultyMax', difficultyMax.toString());
        if (frequency) params.append('frequency', frequency);
        
        const queryString = params.toString();
        return `/groups/${groupId}/templates${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => {
        // Handle ApiResponse wrapper or direct array
        return response.data || response.templates || response;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Template' as const, id })),
              { type: 'Template' as const, id: 'LIST' },
            ]
          : [{ type: 'Template' as const, id: 'LIST' }],
      // Cache for 10 minutes
      keepUnusedDataFor: 600,
    }),

    // Get single template by ID
    getTemplate: builder.query<TaskTemplate, { groupId: string; id: string }>({
      query: ({ groupId, id }) => `/groups/${groupId}/templates/${id}`,
      transformResponse: (response: any) => {
        return response.data || response;
      },
      providesTags: (_result, _error, { id }) => [{ type: 'Template', id }],
    }),

    // Create new group-specific template (admin only)
    createTemplate: builder.mutation<
      TaskTemplate,
      CreateTemplateRequest & { groupId: string }
    >({
      query: ({ groupId, ...body }) => ({
        url: `/groups/${groupId}/templates`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },
      invalidatesTags: [{ type: 'Template', id: 'LIST' }],
    }),

    // Update existing group-specific template (admin only)
    updateTemplate: builder.mutation<
      TaskTemplate,
      { groupId: string; id: string } & UpdateTemplateRequest
    >({
      query: ({ groupId, id, ...body }) => ({
        url: `/groups/${groupId}/templates/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id },
        { type: 'Template', id: 'LIST' },
      ],
    }),

    // Delete group-specific template (admin only, soft delete)
    deleteTemplate: builder.mutation<void, { groupId: string; id: string }>({
      query: ({ groupId, id }) => ({
        url: `/groups/${groupId}/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id },
        { type: 'Template', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = templateApi;
