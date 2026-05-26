import axios from "axios";

const instance = axios.create({
  baseURL: "https://backbookveteranua-production.up.railway.app/",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("jwt") || window.sessionStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.localStorage.removeItem("jwt");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
