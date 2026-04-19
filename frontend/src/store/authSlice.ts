import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  quota: { quotaBytes: number; usedBytes: number } | null;
}

const initialState: AuthState = { user: null, quota: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
      state.quota = action.payload?.storageQuota || null;
    },
    clearUser(state) {
      state.user = null;
      state.quota = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;