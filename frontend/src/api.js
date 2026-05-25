import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Intercepteur : ajouter le token JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexus_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : si 401, supprimer le token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("nexus_token");
      localStorage.removeItem("nexus_user");
    }
    return Promise.reject(err);
  }
);

export default api;
