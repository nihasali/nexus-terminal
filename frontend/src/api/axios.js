import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true
});

api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // If there is no response (real network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    const url = originalRequest.url;

    // DO NOT run refresh logic for these routes
    const publicRoutes = [
      "Users/signup/",
      "Users/login/",
      "Users/verify-otp/",
      "Users/current-user/"
    ];

    if (publicRoutes.some(route => url.includes(route))) {
      return Promise.reject(error);
    }

    // Only handle 401 for protected routes
    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await api.post("Users/refresh-token/");
      return api(originalRequest);
    } catch (refreshError) {
      // Only redirect when user was previously logged in
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);


export default api;
