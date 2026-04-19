import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FileState {
  currentFolderId: string | null;
  files: any[];
  folders: any[];
  loading: boolean;
}

const initialState: FileState = {
  currentFolderId: null,
  files: [],
  folders: [],
  loading: false,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setCurrentFolder(state, action: PayloadAction<string | null>) {
      state.currentFolderId = action.payload;
    },
    setFiles(state, action: PayloadAction<any[]>) {
      state.files = action.payload;
    },
    setFolders(state, action: PayloadAction<any[]>) {
      state.folders = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setCurrentFolder, setFiles, setFolders, setLoading } = fileSlice.actions;
export default fileSlice.reducer;