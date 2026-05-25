import axios from 'axios';
import { storage } from '../Storage';
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL||'https://voxvision-backend-yv1n.onrender.com'
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = storage.get('vv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const registerUser  = (data) => api.post('/auth/register', data);
export const loginUser     = (data) => api.post('/auth/login',    data);
export const getMe         = ()     => api.get('/auth/me');

// ── NFC Tags ──────────────────────────────────────────────────────────────
export const createTag     = (data)    => api.post('/tags/create',  data);
export const getTag        = (tagId)   => api.get(`/tags/${tagId}`);
export const updateTag     = (id, data)=> api.put(`/tags/${id}`,    data);
export const deleteTag     = (id)      => api.delete(`/tags/${id}`);
export const getMyTags     = ()        => api.get('/tags/my');

// ── Store ─────────────────────────────────────────────────────────────────
export const createOrder   = (data) => api.post('/orders/create',    data);
export const getMyOrders   = ()     => api.get('/orders/my');
export const createDonation= (data) => api.post('/donations/create', data);

export default api;
