import { apiSlice } from '@/app/api/apiSlice';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<ApiResponse<AuthResponse>, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
