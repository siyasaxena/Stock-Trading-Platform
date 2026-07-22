import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Automatically sends cookies with requests
});

// Attach bearer token if stored in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
