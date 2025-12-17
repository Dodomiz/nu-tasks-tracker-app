import { apiSlice } from '@/app/api/apiSlice';
import type { DashboardResponse } from '@/types/dashboard';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 12 } = {}) => ({
        url: '/dashboard',
        params: { page, pageSize },
      }),
      transformResponse: (response: ApiResponse<DashboardResponse> | DashboardResponse) => {
        if ((response as any)?.data) return (response as ApiResponse<DashboardResponse>).data;
        return response as DashboardResponse;
      },
      providesTags: () => [{ type: 'Group' as const, id: 'DASHBOARD' }],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
