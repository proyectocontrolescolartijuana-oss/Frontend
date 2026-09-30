import axios from "axios";
import {
  SESSION_EXPIRED_EVENT,
  clearStoredAuth,
  markSessionExpired,
} from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const hadSession = Boolean(localStorage.getItem("token"));

    if (isUnauthorized && hadSession) {
      markSessionExpired();
      clearStoredAuth();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  },
);

export default api;
