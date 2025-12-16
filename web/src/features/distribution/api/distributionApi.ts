import { apiSlice } from '@/app/api/apiSlice';

export interface GenerateDistributionRequest {
  groupId: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  userIds?: string[];
}

export interface GenerateDistributionResponse {
  previewId: string;
  status: string;
}

export interface DistributionStats {
  totalTasks: number;
  totalUsers: number;
  workloadVariance: number;
  tasksPerUser: Record<string, number>;
}

export interface AssignmentProposal {
  taskId: string;
  taskName: string;
  assignedUserId: string;
  assignedUserName: string;
  confidence: number;
  rationale?: string | null;
}

export interface DistributionPreview {
  id: string;
  status: string; // Pending | Processing | Completed | Failed
  method: string; // AI | Rule-Based
  assignments: AssignmentProposal[];
  stats?: DistributionStats | null;
  error?: string | null;
  createdAt: string;
}

export interface ApplyDistributionRequest {
  modifications?: { taskId: string; newAssignedUserId: string }[];
}

export interface ApplyDistributionResponse {
  assignedCount: number;
  modifiedCount: number;
  finalStats: DistributionStats;
}

export const distributionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateDistribution: builder.mutation<{ data: GenerateDistributionResponse }, GenerateDistributionRequest>({
      query: (body) => ({
        url: '/distribution/generate',
        method: 'POST',
        body,
      }),
    }),

    getPreview: builder.query<{ data: DistributionPreview }, string>({
      query: (previewId) => `/distribution/preview/${previewId}`,
      // Allow caller to pass polling via options
    }),

    applyDistribution: builder.mutation<{ data: ApplyDistributionResponse }, { id: string; body: ApplyDistributionRequest }>({
      query: ({ id, body }) => ({
        url: `/distribution/${id}/apply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGenerateDistributionMutation,
  useGetPreviewQuery,
  useLazyGetPreviewQuery,
  useApplyDistributionMutation,
} = distributionApi;
