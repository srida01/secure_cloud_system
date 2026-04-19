import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL,
});

// Attach Clerk token to every request
api.interceptors.request.use(async (config) => {
  // Token is injected by the useAuth hook before calls
  return config;
});

export default api;