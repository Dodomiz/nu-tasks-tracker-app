import { apiSlice } from '@/app/api/apiSlice';
import type {
  Group,
  GroupsResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  InviteResponse,
  PromoteMemberRequest,
  RemoveMemberRequest,
} from '@/types/group';

export const groupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's groups
    getMyGroups: builder.query<GroupsResponse, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 50 } = {}) => ({
        url: '/groups',
        params: { page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.groups.map(({ id }) => ({ type: 'Group' as const, id })),
              { type: 'Group', id: 'LIST' },
            ]
          : [{ type: 'Group', id: 'LIST' }],
    }),

    // Get specific group details
    getGroup: builder.query<Group, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Group', id }],
    }),

    // Create new group
    createGroup: builder.mutation<Group, CreateGroupRequest>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),

    // Update existing group
    updateGroup: builder.mutation<Group, { id: string; body: UpdateGroupRequest }>({
      query: ({ id, body }) => ({
        url: `/groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Group', id },
        { type: 'Group', id: 'LIST' },
      ],
    }),

    // Invite member via email
    inviteMember: builder.mutation<InviteResponse, { groupId: string; email: string }>({
      query: ({ groupId, email }) => ({
        url: `/groups/${groupId}/invite`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Group', id: groupId }],
    }),

    // Join group via invitation code
    joinGroup: builder.mutation<Group, string>({
      query: (invitationCode) => ({
        url: `/groups/join/${invitationCode}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),

    // Promote member to Admin
    promoteMember: builder.mutation<void, PromoteMemberRequest>({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}/promote`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Group', id: groupId }],
    }),

    // Remove member from group
    removeMember: builder.mutation<void, RemoveMemberRequest>({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Group', id: groupId }],
    }),
  }),
});

export const {
  useGetMyGroupsQuery,
  useGetGroupQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useInviteMemberMutation,
  useJoinGroupMutation,
  usePromoteMemberMutation,
  useRemoveMemberMutation,
} = groupApi;
