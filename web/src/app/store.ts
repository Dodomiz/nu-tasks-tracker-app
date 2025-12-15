import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { apiSlice } from './api/apiSlice';
import { tasksApi } from '@/features/tasks/api/tasksApi';
import authReducer from '@/features/auth/authSlice';
import languageReducer from './slices/languageSlice';
import groupReducer from '@/features/groups/groupSlice';
import notificationsReducer from './slices/notificationsSlice';

// Configure persist for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
};

// Configure persist for language slice
const languagePersistConfig = {
  key: 'language',
  storage,
  whitelist: ['current', 'direction'],
};

// Configure persist for group slice
const groupPersistConfig = {
  key: 'group',
  storage,
  whitelist: ['currentGroupId', 'groups'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedLanguageReducer = persistReducer(languagePersistConfig, languageReducer);
const persistedGroupReducer = persistReducer(groupPersistConfig, groupReducer);

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    auth: persistedAuthReducer,
    language: persistedLanguageReducer,
    group: persistedGroupReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware, tasksApi.middleware),
});

export const persistor = persistStore(store);

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
