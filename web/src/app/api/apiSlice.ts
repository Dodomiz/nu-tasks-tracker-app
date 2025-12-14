import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens
        const data = refreshResult.data as any;
        api.dispatch({
          type: 'auth/setCredentials',
          payload: {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            user: data.data.user,
          },
        });

        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - logout
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Group', 'Task', 'Notification', 'Leaderboard', 'Race', 'Reward', 'Message'],
  endpoints: () => ({}),
});
