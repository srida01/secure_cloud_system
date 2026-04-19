import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.ts';
import fileReducer from './fileSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: fileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;