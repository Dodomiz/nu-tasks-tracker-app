import { apiSlice } from '@/app/api/apiSlice';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_PENDING_APPROVAL'
  | 'GROUP_MEMBER_JOINED'
  | 'GROUP_MEMBER_REMOVED'
  | 'GROUP_INVITATION_RECEIVED';

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  content: {
    title: string;
    body: string;
    metadata?: Record<string, any>;
  };
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsRequest {
  userId: string;
  skip?: number;
  take?: number;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  content: {
    title: string;
    body: string;
    metadata?: Record<string, any>;
  };
}

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse[], GetNotificationsRequest>({
      query: ({ userId, skip = 0, take = 50 }) => ({
        url: `/notifications`,
        params: { userId, skip, take },
      }),
      transformResponse: (response: { data: NotificationResponse[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),
    
    getUnreadCount: builder.query<number, string>({
      query: (userId) => `/notifications/unread-count?userId=${userId}`,
      transformResponse: (response: { data: number }) => response.data,
      providesTags: [{ type: 'Notification', id: 'UNREAD_COUNT' }],
    }),

    markAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ],
    }),

    markAllAsRead: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/notifications/read-all`,
        method: 'PUT',
        params: { userId },
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ],
    }),

    createNotification: builder.mutation<NotificationResponse, CreateNotificationRequest>({
      query: (notification) => ({
        url: `/notifications`,
        method: 'POST',
        body: notification,
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useCreateNotificationMutation,
} = notificationsApi;
