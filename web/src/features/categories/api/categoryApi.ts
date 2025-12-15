import { apiSlice } from '@/app/api/apiSlice';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';

interface GetCategoriesParams {
  groupId: string;
}

/**
 * Category API endpoints using RTK Query
 */
export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories (system + custom) for a group
    getCategories: builder.query<Category[], GetCategoriesParams>({
      query: ({ groupId }) => `/categories?groupId=${groupId}`,
      transformResponse: (response: any) => {
        // Handle ApiResponse wrapper
        return response.data || response;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
      // Cache for 10 minutes
      keepUnusedDataFor: 600,
    }),

    // Get single category by ID
    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: any) => {
        return response.data || response;
      },
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    // Create new custom category (admin only)
    createCategory: builder.mutation<
      Category,
      CreateCategoryRequest & { groupId: string }
    >({
      query: ({ groupId, ...body }) => ({
        url: '/categories',
        method: 'POST',
        body,
        params: { groupId },
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // Update existing custom category (admin only)
    updateCategory: builder.mutation<
      Category,
      { id: string } & UpdateCategoryRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    // Delete custom category (admin only, only if no tasks assigned)
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
