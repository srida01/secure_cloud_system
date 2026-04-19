import api from './api';

export const fileService = {
  async getFiles(folderId?: string, token?: string) {
    const res = await api.get('/files', {
      params: { folderId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  async uploadFile(file: File, folderId: string, token: string, onProgress?: (p: number) => void) {
    const form = new FormData();
    form.append('file', file);
    form.append('folderId', folderId);
    const res = await api.post('/files/upload', form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return res.data.data;
  },

  async deleteFile(id: string, token: string) {
    await api.delete(`/files/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  },

  async downloadFile(id: string, token: string) {
    const res = await api.get(`/files/${id}/download`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.data;
  },

  async searchFiles(query: string, token: string) {
    const res = await api.get('/search', {
      params: { q: query },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },
};

export const folderService = {
  async getFolders(parentFolderId?: string | null, token?: string) {
    const res = await api.get('/folders', {
      params: { parentFolderId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  async createFolder(name: string, parentFolderId: string | null, token: string) {
    const res = await api.post('/folders', { name, parentFolderId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  async deleteFolder(id: string, token: string) {
    await api.delete(`/folders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  },
};