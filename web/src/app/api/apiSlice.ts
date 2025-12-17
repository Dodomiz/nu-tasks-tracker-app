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

// Mutex to prevent concurrent refresh requests
let refreshPromise: Promise<any> | null = null;

// Base query with automatic token refresh and mutex
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  // Wait for any in-progress refresh
  if (refreshPromise) {
    await refreshPromise;
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken && !refreshPromise) {
      // Start refresh and store promise
      refreshPromise = (async () => {
        try {
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
            return true;
          } else {
            // Refresh failed - logout
            api.dispatch({ type: 'auth/logout' });
            return false;
          }
        } finally {
          refreshPromise = null;
        }
      })();

      const refreshSuccess = await refreshPromise;
      
      if (refreshSuccess) {
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      }
    } else if (!refreshToken) {
      // No refresh token available - logout
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Group', 'GroupInvites', 'Task', 'Notification', 'Leaderboard', 'Race', 'Reward', 'Message', 'Category', 'Template'],
  endpoints: () => ({}),
});
