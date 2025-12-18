import { apiSlice } from '@/app/api/apiSlice';
import type {
  Group,
  GroupsResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  InviteResponse,
  PromoteMemberRequest,
  DemoteMemberRequest,
  RemoveMemberRequest,
} from '@/types/group';
import type {

  InviteResponse as CodeInviteResponse,
  InvitesListResponse,
  RedeemInviteRequest,
  RedeemInviteResponse,
} from '@/types/invite';

export const groupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's groups
    getMyGroups: builder.query<GroupsResponse, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 50 } = {}) => ({
        url: '/groups',
        params: { page, pageSize },
      }),
      transformResponse: (response: any) => response.data || response,
      providesTags: (result) =>
        result
          ? [
              ...result.groups.map(({ id }) => ({ type: 'Group' as const, id })),
              { type: 'Group', id: 'LIST' },
            ]
          : [{ type: 'Group', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as any;
          const currentGroupId = state.group.currentGroupId;
          
          // Hydrate groups in Redux (handles persisted group restoration)
          const { hydrateGroups, setCurrentGroup } = await import('./groupSlice');
          dispatch(hydrateGroups(data.groups));
          
          // If persisted group no longer exists and there are groups, select the first one
          if (currentGroupId && !data.groups.find(g => g.id === currentGroupId)) {
            if (data.groups.length > 0) {
              dispatch(setCurrentGroup(data.groups[0].id));
            }
          }
        } catch (error) {
          // Query failed, but we don't need to do anything special
        }
      },
    }),

    // Get specific group details
    getGroup: builder.query<Group, string>({
      query: (id) => `/groups/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Group', id }],
      async onQueryStarted(groupId, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          // Handle 403 (not a member) or 404 (deleted)
          if (error?.error?.status === 403 || error?.error?.status === 404) {
            const state = getState() as any;
            const currentGroupId = state.group.currentGroupId;
            
            // If this was the current group, clear it
            if (currentGroupId === groupId) {
              const { setCurrentGroup } = await import('./groupSlice');
              dispatch(setCurrentGroup(null));
            }
          }
        }
      },
    }),

    // Create new group
    createGroup: builder.mutation<Group, CreateGroupRequest>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: [
        { type: 'Group', id: 'LIST' },
        { type: 'Group', id: 'DASHBOARD' },
      ],
    }),

    // Update existing group
    updateGroup: builder.mutation<Group, { id: string; body: UpdateGroupRequest }>({
      query: ({ id, body }) => ({
        url: `/groups/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Group', id },
        { type: 'Group', id: 'LIST' },
        { type: 'Group', id: 'DASHBOARD' },
      ],
    }),

    // Invite member via email
    inviteMember: builder.mutation<InviteResponse, { groupId: string; email: string }>({
      query: ({ groupId, email }) => ({
        url: `/groups/${groupId}/invite`,
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Group', id: groupId }],
    }),

    // Join group via invitation code
    joinGroup: builder.mutation<Group, string>({
      query: (invitationCode) => ({
        url: `/groups/join/${invitationCode}`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: [
        { type: 'Group', id: 'LIST' },
        { type: 'Group', id: 'DASHBOARD' },
      ],
    }),

    // Promote member to Admin
    promoteMember: builder.mutation<void, PromoteMemberRequest>({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}/promote`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Group', id: groupId }],
    }),

    // Demote member to Regular User
    demoteMember: builder.mutation<void, DemoteMemberRequest>({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}/demote`,
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
      async onQueryStarted({ groupId, userId }, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
          
          // Check if the removed user is the current user
          const state = getState() as any;
          const currentUser = state.auth.user;
          const currentGroupId = state.group.currentGroupId;
          
          if (currentUser?.id === userId && currentGroupId === groupId) {
            // Current user was removed from their current group
            const { setCurrentGroup } = await import('./groupSlice');
            dispatch(setCurrentGroup(null));
          }
        } catch (error) {
          // Mutation failed, no action needed
        }
      },
    }),

    // Get group members (hydrated)
    getGroupMembers: builder.query<import('@/types/group').Member[], string>({
      query: (groupId) => `/groups/${groupId}/members`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, groupId) => [{ type: 'Group', id: groupId }],
    }),

    // Get group invites
    getGroupInvites: builder.query<import('@/types/group').InviteDto[], string>({
      query: (groupId) => `/groups/${groupId}/invites`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, groupId) => [{ type: 'GroupInvites', id: groupId }],
    }),

    // Resend invite
    resendInvite: builder.mutation<void, { groupId: string; inviteId: string }>({
      query: ({ groupId, inviteId }) => ({
        url: `/groups/${groupId}/invites/${inviteId}/resend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'GroupInvites', id: groupId }],
    }),

    // Cancel invite
    cancelInvite: builder.mutation<void, { groupId: string; inviteId: string }>({
      query: ({ groupId, inviteId }) => ({
        url: `/groups/${groupId}/invites/${inviteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'GroupInvites', id: groupId }],
    }),

    // Delete group
    deleteGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Group', id },
        { type: 'Group', id: 'LIST' },
      ],
      async onQueryStarted(groupId, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
          
          const state = getState() as any;
          const currentGroupId = state.group.currentGroupId;
          
          if (currentGroupId === groupId) {
            // Current group was deleted
            const { setCurrentGroup } = await import('./groupSlice');
            dispatch(setCurrentGroup(null));
          }
        } catch (error) {
          // Mutation failed, no action needed
        }
      },
    }),

    // FR-026: Create code-based invitation
    createCodeInvite: builder.mutation<CodeInviteResponse, { groupId: string; email?: string }>({
      query: ({ groupId, email }) => ({
        url: `/groups/${groupId}/code-invites`,
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: 'CodeInvite', id: groupId },
      ],
    }),

    // FR-026: Get all code-based invitations for a group
    getGroupCodeInvites: builder.query<InvitesListResponse, string>({
      query: (groupId) => `/groups/${groupId}/code-invites`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (result, _error, groupId) =>
        result
          ? [
              ...result.invites.map(({ id }) => ({ type: 'CodeInvite' as const, id })),
              { type: 'CodeInvite', id: groupId },
            ]
          : [{ type: 'CodeInvite', id: groupId }],
    }),

    // FR-026: Redeem invitation code
    redeemCodeInvite: builder.mutation<RedeemInviteResponse, RedeemInviteRequest>({
      query: (body) => ({
        url: '/code-invites/redeem',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: [
        { type: 'Group', id: 'LIST' },
        { type: 'Group', id: 'DASHBOARD' },
      ],
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
  useDemoteMemberMutation,
  useRemoveMemberMutation,
  useGetGroupMembersQuery,
  useGetGroupInvitesQuery,
  useResendInviteMutation,
  useCancelInviteMutation,
  useDeleteGroupMutation,
  useCreateCodeInviteMutation,
  useGetGroupCodeInvitesQuery,
  useRedeemCodeInviteMutation,
} = groupApi;
